// @flow
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import moment from 'moment';

import * as actions from '../../actions';
import { COLORS } from '../../constants';
import { capitalize } from '../../utils';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Toggle from '../Toggle';
import LargeLED from '../LargeLED';
import EjectButton from '../EjectButton';
import TerminalOutput from '../TerminalOutput';
import WindowDimensions from '../WindowDimensions';

import type { Command, Project, Dispatch } from '../../types';

type Props = {
  project: Project,
  isVisible: boolean,
  isDisabled: boolean,
  onDismiss: () => void,
  // From Redux:
  command?: Command,
  runCommand: Dispatch<typeof actions.runCommand>,
  abortCommand: Dispatch<typeof actions.abortCommand>,
};

class CommandDetailsModal extends PureComponent<Props> {
  handleToggle = () => {
    const { command, runCommand, abortCommand, project } = this.props;
    if (!command) {
      return;
    }

    const isRunning = !!command.processId;

    const timestamp = new Date();

    isRunning
      ? abortCommand(command, timestamp)
      : runCommand(project, command, timestamp);
  };

  renderPrimaryStatusText = ({ status }: Command) => {
    switch (status) {
      case 'idle':
        return (
          <PrimaryStatusText>
            Command is <strong>idle</strong>.
          </PrimaryStatusText>
        );

      case 'pending':
        return (
          <PrimaryStatusText>
            Command is{' '}
            <strong style={{ color: COLORS.orange[500] }}>running</strong>...
          </PrimaryStatusText>
        );

      case 'success':
        return (
          <PrimaryStatusText>
            Command{' '}
            <strong style={{ color: COLORS.green[700] }}>
              completed successfully
            </strong>.
          </PrimaryStatusText>
        );

      case 'failed':
        return (
          <PrimaryStatusText>
            Command <strong>failed</strong>.
          </PrimaryStatusText>
        );

      default:
        return null;
    }
  };

  renderTimestamp = ({ status, timeSinceStatusChange }: Command) => {
    if (!timeSinceStatusChange) {
      return null;
    }

    switch (status) {
      case 'idle':
        return (
          <LastRunText>
            Last run:{' '}
            {moment(timeSinceStatusChange).format('MMMM Do, YYYY [at] h:mm a')}
          </LastRunText>
        );

      case 'success':
      case 'failed':
        return (
          <LastRunText>{moment(timeSinceStatusChange).calendar()}</LastRunText>
        );

      case 'pending':
      default: {
        return null;
      }
    }
  };

  renderContents() {
    const { command, isVisible, isDisabled } = this.props;

    if (!isVisible || !command) {
      return null;
    }

    const { name, status, processId, shortcut } = command;

    const isRunning = !!processId;

    // HACK: So, we want the terminal to occupy as much height as it can.
    // To do this, we set it to the window height, minus the height of all the
    // other stuff added together.
    // I can't simply use a flex column because the available modal height is
    // unknown.
    // It doesn't have to be perfect, so I'm not worried about small changes to
    // the header or status indicators.
    const APPROXIMATE_NON_TERMINAL_HEIGHT = 380;

    return (
      <Fragment>
        <ModalHeader
          title={capitalize(name)}
          action={
            name === 'eject' ? (
              <EjectButton
                width={40}
                height={34}
                isRunning={isRunning}
                onClick={this.handleToggle}
              />
            ) : (
              <Toggle
                size={32}
                isDisabled={isDisabled}
                isToggled={isRunning}
                onToggle={this.handleToggle}
              />
            )
          }
        >
          <Description>{shortcut}</Description>
        </ModalHeader>

        <MainContent>
          <Status>
            <LargeLED size={48} status={status} />
            <StatusLabel>
              {this.renderPrimaryStatusText(command)}
              {this.renderTimestamp(command)}
            </StatusLabel>
          </Status>

          <HorizontalRule />

          <WindowDimensions>
            {({ height }) => (
              <TerminalOutput
                height={height - APPROXIMATE_NON_TERMINAL_HEIGHT}
                title="Output"
                task={command}
              />
            )}
          </WindowDimensions>
        </MainContent>
      </Fragment>
    );
  }

  render() {
    const { isVisible, onDismiss } = this.props;

    return (
      <Modal width={620} isVisible={isVisible} onDismiss={onDismiss}>
        {this.renderContents()}
      </Modal>
    );
  }
}

const MainContent = styled.section`
  padding: 25px;
`;

const Description = styled.div`
  font-size: 21px;
  color: ${COLORS.gray[500]};
`;

const Status = styled.div`
  display: flex;
  align-items: center;
`;

const StatusLabel = styled.div`
  margin-left: 10px;
`;

const PrimaryStatusText = styled.div`
  font-size: 20px;
`;

const LastRunText = styled.div`
  color: ${COLORS.gray[400]};
  font-size: 16px;
`;

const HorizontalRule = styled.div`
  height: 0px;
  margin-top: 25px;
  border-bottom: 1px solid ${COLORS.gray[200]};
`;

export default connect(
  undefined,
  { runCommand: actions.runCommand, abortCommand: actions.abortCommand }
)(CommandDetailsModal);
