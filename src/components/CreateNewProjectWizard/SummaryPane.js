// @flow
import React, { PureComponent, Fragment } from 'react';
import styled from 'styled-components';

import { COLORS } from '../../constants';

import Paragraph from '../Paragraph';
import FadeIn from '../FadeIn';
import Spacer from '../Spacer';
import Logo from '../Logo';
import ExternalLink from '../ExternalLink';

import ImportExisting from './ImportExisting';

import type { ProjectType } from '../../types';
import type { Field, Step } from './types';

type Props = {
  currentStep: Step,
  activeField: ?Field,
  projectType: ?ProjectType,
};

class SummaryPane extends PureComponent<Props> {
  renderPaneContents() {
    const { currentStep, activeField, projectType } = this.props;

    // If we're still in the first step, we want to show our intro details.
    if (currentStep === 'projectName') {
      return (
        <IntroWrapper>
          <FadeIn key="intro-t">
            <Logo size="large" />

            <Spacer size={30} />
            <StepTitle>Create new plugin</StepTitle>
            <Paragraph>Let's start by giving your new plugin a name.</Paragraph>

            <Spacer size={130} />
            <ImportExisting />
          </FadeIn>
        </IntroWrapper>
      );
    }

    // After that first step, there's a "default" display for each step,
    // but that can be overridden with active focus.
    const focusField = activeField || currentStep;

    switch (focusField) {
      case 'projectName': {
        return (
          <Fragment>
            <FadeIn key="s1-1">
              <StepTitle>Plugin Name</StepTitle>
              <Paragraph>
                Don't stress too much about your plugin's name! You can always
                change this later.
              </Paragraph>
            </FadeIn>
          </Fragment>
        );
      }

      case 'projectType': {
        let details;

        switch (projectType) {
          default: {
            details = (
              <Paragraph>
                Skpm can create plugins from different templates to get you
                started quicker. Click a template to learn more about it.
              </Paragraph>
            );
            break;
          }
          case 'empty': {
            details = (
              <Fragment>
                <Paragraph>
                  <strong>Empty</strong>
                </Paragraph>
                <Paragraph>
                  A barebone boilerplate to get you started.
                </Paragraph>
                <Paragraph>
                  One command sitting in the plugin menu and printing a message
                  when triggered. That's the "Hello World" of Sketch plugin
                  development.
                </Paragraph>
                <Paragraph>
                  <ExternalLink
                    color={COLORS.white}
                    hoverColor={COLORS.white}
                    href="https://github.com/skpm/skpm"
                  >
                    <strong>Learn more about skpm.</strong>
                  </ExternalLink>
                </Paragraph>
              </Fragment>
            );
            break;
          }
          case 'webview': {
            details = (
              <Fragment>
                <Paragraph>
                  <strong>Webview</strong>
                </Paragraph>
                <Paragraph>A webview is panel displaying a web page.</Paragraph>
                <Paragraph>
                  Some plugins need to display a UI to the user. A webview is
                  the perfect candidate to easily display custom UIs. Use web
                  technologies to create rich controls for your Sketch plugin.
                </Paragraph>
                <Paragraph>
                  <ExternalLink
                    color={COLORS.white}
                    hoverColor={COLORS.white}
                    href="https://github.com/skpm/sketch-module-web-view"
                  >
                    <strong>Learn more about webviews.</strong>
                  </ExternalLink>
                </Paragraph>
              </Fragment>
            );
            break;
          }
          case 'datasupplier': {
            details = (
              <Fragment>
                <Paragraph>
                  <strong>Data Supplier</strong>
                </Paragraph>
                <Paragraph>
                  A Data Supplier is a source for the Data feature introduced in
                  Sketch 52.
                </Paragraph>
                <Paragraph>
                  It's great for providing data from a custom dataset or an API
                  to allow designers to design with real data.
                </Paragraph>
                <Paragraph>
                  <ExternalLink
                    color={COLORS.white}
                    hoverColor={COLORS.white}
                    href="https://blog.sketchapp.com/do-more-with-data-2b765e870e4f"
                  >
                    <strong>Learn more about Data Suppliers.</strong>
                  </ExternalLink>
                </Paragraph>
              </Fragment>
            );
            break;
          }
        }
        return (
          <Fragment>
            <FadeIn key="s2t">
              <StepTitle>Project Type</StepTitle>
              {details}
            </FadeIn>
          </Fragment>
        );
      }

      case 'projectIcon': {
        return (
          <Fragment>
            <FadeIn key="s3t">
              <StepTitle>Plugin Icon</StepTitle>

              <Paragraph>
                Choose an icon, to help you recognize this plugin from a list.
              </Paragraph>
              <Paragraph>
                It will used in the Plugin list and when showing an alert from
                your plugin.
              </Paragraph>
              <Paragraph>It must be a 128x128 png.</Paragraph>
            </FadeIn>
          </Fragment>
        );
      }

      default:
        throw new Error('Unrecognized `focusField`: ' + focusField);
    }
  }

  render() {
    return <Wrapper>{this.renderPaneContents()}</Wrapper>;
  }
}

const Wrapper = styled.div`
  text-shadow: 1px 1px 0px rgba(13, 37, 170, 0.1);
`;

const StepTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
`;

const IntroWrapper = styled.div`
  text-align: center;
  padding-top: 20px;
`;

export default SummaryPane;
