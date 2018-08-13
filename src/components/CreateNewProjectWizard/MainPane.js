// @flow
import React, { PureComponent, Fragment } from 'react';
import { Motion, spring } from 'react-motion';
import styled from 'styled-components';
import { remote } from 'electron';
import * as fs from 'fs';

import emptyIconSrc from '../../assets/images/empty.svg';
import webviewIconSrc from '../../assets/images/webview.svg';
import defaultPluginIconSrc from '../../assets/images/default-plugin-icon.png';

import FormField from '../FormField';
import SelectableImage from '../SelectableImage';
import Button from '../Button';
import ButtonWithIcon from '../ButtonWithIcon';
import Spacer from '../Spacer';
import FadeIn from '../FadeIn';

import ProjectName from './ProjectName';
import SubmitButton from './SubmitButton';

import type { Field, Status } from './types';
import type { ProjectType } from '../../types';

type Props = {
  projectName: string,
  projectType: ?ProjectType,
  projectIcon: ?string,
  activeField: ?Field,
  status: Status,
  currentStepIndex: number,
  hasBeenSubmitted: boolean,
  isProjectNameTaken: boolean,
  updateFieldValue: (field: Field, value: any) => void,
  focusField: (field: ?Field) => void,
  handleSubmit: () => void,
};

class MainPane extends PureComponent<Props> {
  handleFocusProjectName = () => this.props.focusField('projectName');
  handleBlurProjectName = () => this.props.focusField(null);

  updateProjectName = (projectName: string) =>
    this.props.updateFieldValue('projectName', projectName);
  updateProjectType = (projectType: ProjectType) =>
    this.props.updateFieldValue('projectType', projectType);
  updateProjectIcon = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Plugin Icon',
        buttonLabel: 'Choose',
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['png'] }],
      },
      paths => {
        if (paths && paths[0]) {
          fs.readFile(paths[0], 'base64', (err, projectIcon) => {
            if (err) {
              console.error(err);
              return;
            }
            this.props.updateFieldValue('projectIcon', projectIcon);
          });
        }
      }
    );
  };

  render() {
    const {
      projectName,
      projectType,
      projectIcon,
      activeField,
      currentStepIndex,
      hasBeenSubmitted,
      isProjectNameTaken,
      handleSubmit,
    } = this.props;

    return (
      <Fragment>
        <Motion style={{ offset: spring(currentStepIndex === 0 ? 50 : 0) }}>
          {({ offset }) => (
            <Wrapper style={{ transform: `translateY(${offset}px)` }}>
              <ProjectName
                name={projectName}
                isFocused={activeField === 'projectName'}
                handleFocus={this.handleFocusProjectName}
                handleBlur={this.handleBlurProjectName}
                handleChange={this.updateProjectName}
                handleSubmit={handleSubmit}
                isProjectNameTaken={isProjectNameTaken}
              />

              {currentStepIndex > 0 && (
                <FadeIn>
                  <FormField
                    label="Plugin Type"
                    isFocused={activeField === 'projectType'}
                  >
                    <ProjectTypeTogglesWrapper>
                      <ButtonWithIcon
                        showOutline={projectType === 'empty'}
                        icon={<EmptyIcon src={emptyIconSrc} />}
                        onClick={() => this.updateProjectType('empty')}
                      >
                        Empty
                      </ButtonWithIcon>
                      <Spacer inline size={10} />
                      <ButtonWithIcon
                        showOutline={projectType === 'webview'}
                        icon={<Icon src={webviewIconSrc} />}
                        onClick={() => this.updateProjectType('webview')}
                      >
                        Webview
                      </ButtonWithIcon>
                    </ProjectTypeTogglesWrapper>
                  </FormField>
                </FadeIn>
              )}

              {currentStepIndex > 1 && (
                <FadeIn>
                  <FormField
                    label="Plugin Icon"
                    focusOnClick={false}
                    isFocused={activeField === 'projectIcon'}
                  >
                    <ProjectIconWrapper>
                      <SelectableImage
                        src={
                          projectIcon
                            ? `data:image/png;base64, ${projectIcon}`
                            : defaultPluginIconSrc
                        }
                        size={60}
                        onClick={this.updateProjectIcon}
                        status="default"
                      />
                      <ProjectIconButton onClick={this.updateProjectIcon}>
                        Choose Another Icon
                      </ProjectIconButton>
                    </ProjectIconWrapper>
                  </FormField>
                </FadeIn>
              )}
            </Wrapper>
          )}
        </Motion>
        <SubmitButtonWrapper>
          <SubmitButton
            isDisabled={
              isProjectNameTaken ||
              !projectName ||
              (currentStepIndex > 0 && !projectType)
            }
            readyToBeSubmitted={currentStepIndex >= 2}
            hasBeenSubmitted={hasBeenSubmitted}
            onSubmit={handleSubmit}
          />
        </SubmitButtonWrapper>
      </Fragment>
    );
  }
}

const Wrapper = styled.div`
  height: 470px;
  will-change: transform;
`;

const Icon = styled.img`
  width: 22px;
  height: 22px;
`;

const EmptyIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const ProjectTypeTogglesWrapper = styled.div`
  margin-top: 8px;
  margin-left: -8px;
`;

const ProjectIconWrapper = styled.div`
  margin-top: 16px;
`;

const ProjectIconButton = styled(Button)`
  position: relative;
  margin-left: 20px;
  top: -24px;
`;

const SubmitButtonWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 30px;
  text-align: center;
`;

export default MainPane;
