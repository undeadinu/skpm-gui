// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions';
import { getSelectedProject } from '../../reducers/projects.reducer';
import { SKPM_REPO_URL } from '../../constants';

import Module from '../Module';
import CommandRunnerPaneRow from '../CommandRunnerPaneRow';
import { StrokeButton } from '../Button';
import AddNewButton from '../AddNewButton';
import OnlyOn from '../OnlyOn';
import AddCommandModal from '../AddCommandModal';
import CommandDetailsModal from '../CommandDetailsModal';

import type { Project } from '../../types';
import type { Dispatch } from '../../actions/types';

type Props = {
  project: Project,
  showPluginMenu: Dispatch<typeof actions.showPluginMenu>,
  runCommand: Dispatch<typeof actions.runCommand>,
  abortCommand: Dispatch<typeof actions.abortCommand>,
};

type State = {
  selectedCommandId: ?string,
  addingNewCommand: boolean,
};

class CommandsPane extends Component<Props, State> {
  state = {
    selectedCommandId: null,
    addingNewCommand: false,
  };

  static getDerivedStateFromProps(props, state) {
    // It's possible that this task is deleted while the modal is open;
    // For example, This can happen when ejecting the project, since the
    // create-react-app "eject" task removes itself upon completion.
    const selectedCommandExists = props.project.commands.some(
      c => c.identifier === state.selectedCommandId
    );

    if (!selectedCommandExists) {
      return { selectedCommandId: null };
    }

    return null;
  }

  openAddNewCommandModal = () => {
    this.setState({ addingNewCommand: true });
  };

  closeAddNewCommandModal = () => {
    this.setState({ addingNewCommand: false });
  };

  handleViewDetails = commandId => {
    this.setState({ selectedCommandId: commandId });
  };

  handleDismissCommandDetails = () => {
    this.setState({ selectedCommandId: null });
  };

  handleToggleCommand = (identifier: string) => {
    const { project, runCommand, abortCommand } = this.props;
    const { commands } = project;

    // eslint-disable-next-line no-shadow
    const command = commands.find(command => command.identifier === identifier);

    // Should be impossible, this is for Flow.
    if (!command) {
      return;
    }

    const isRunning = !!command.processId;

    const timestamp = new Date();

    isRunning
      ? abortCommand(command, timestamp)
      : runCommand(project, command, timestamp);
  };

  render() {
    const { project, showPluginMenu } = this.props;
    const { selectedCommandId, addingNewCommand } = this.state;

    return (
      <Module
        title="Plugin Commands"
        moreInfoHref={`${SKPM_REPO_URL}/blob/skpm/docs/getting-started.md#commands`}
        primaryActionChildren={
          <StrokeButton onClick={showPluginMenu}>Edit menu</StrokeButton>
        }
      >
        {project.commands.map(command => (
          <CommandRunnerPaneRow
            key={command.identifier}
            identifier={command.identifier}
            name={command.name}
            status={command.status}
            processId={command.processId}
            onViewDetails={this.handleViewDetails}
            onToggleCommand={this.handleToggleCommand}
          />
        ))}
        <AddNewButton onClick={this.openAddNewCommandModal}>
          Add New
          <OnlyOn size="lgMin" style={{ paddingLeft: 3 }}>
            Command
          </OnlyOn>
        </AddNewButton>

        <AddCommandModal
          project={project}
          isVisible={addingNewCommand}
          onDismiss={this.closeAddNewCommandModal}
        />

        <CommandDetailsModal
          project={project}
          command={
            selectedCommandId
              ? project.commands.find(
                  command => command.identifier === selectedCommandId
                )
              : undefined
          }
          isVisible={!!selectedCommandId}
          onDismiss={this.handleDismissCommandDetails}
        />
      </Module>
    );
  }
}

const mapStateToProps = state => ({
  project: getSelectedProject(state),
});

export default connect(
  mapStateToProps,
  {
    runCommand: actions.runCommand,
    abortCommand: actions.abortCommand,
    showPluginMenu: actions.showPluginMenu,
  }
)(CommandsPane);
