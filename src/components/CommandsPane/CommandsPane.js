// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { runTask, abortTask } from '../../actions';
import { getSelectedProject } from '../../reducers/projects.reducer';

import Module from '../Module';
import CommandRunnerPaneRow from '../CommandRunnerPaneRow';

import type { Project } from '../../types';

type Props = {
  project: Project,
};

type State = {
  selectedCommandId: ?string,
};

class TaskRunnerPane extends Component<Props, State> {
  state = {
    selectedCommandId: null,
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

  handleViewDetails = commandId => {
    this.setState({ selectedCommandId: commandId });
  };

  handleDismissTaskDetails = () => {
    this.setState({ selectedCommandId: null });
  };

  render() {
    const { project } = this.props;
    const { selectedCommandId } = this.state;

    return (
      <Module
        title="Plugin Commands"
        moreInfoHref="https://github.com/joshwcomeau/guppy/blob/master/docs/getting-started.md#commands"
      >
        {project.commands.map(command => (
          <CommandRunnerPaneRow
            key={command.identifier}
            identifier={command.identifier}
            name={command.name}
            status={command.status}
            processId={command.processId}
            onViewDetails={this.handleViewDetails}
          />
        ))}
      </Module>
    );
  }
}

const mapStateToProps = state => ({
  project: getSelectedProject(state),
});

export default connect(
  mapStateToProps,
  { runTask, abortTask }
)(TaskRunnerPane);
