// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import * as actions from '../../actions';

import { COLORS } from '../../constants';
import { getSelectedProject } from '../../reducers/projects.reducer';
import { getIsQueueEmpty } from '../../reducers/queue.reducer';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Spacer from '../Spacer';
import { FillButton } from '../Button';
import FormField from '../FormField';
import ProjectIconSelection from '../ProjectIconSelection';
import TextInput from '../TextInput';

import type { Project } from '../../types';
import type { Dispatch } from '../../actions/types';

type Props = {
  project: Project | null,
  isVisible: boolean,
  dependenciesChangingForProject: boolean,
  hideModal: Dispatch<typeof actions.hideModal>,
  saveProjectSettings: Dispatch<typeof actions.saveProjectSettingsStart>,
};

type State = {
  newName: string,
  projectIcon: string,
  description: string,
  homepage: string,
  activeField: string,
};

class ProjectConfigurationModal extends PureComponent<Props, State> {
  state = {
    newName: '',
    description: '',
    homepage: '',
    projectIcon: '',
    activeField: 'projectName',
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.project) {
      return;
    }
    this.setState({
      newName: nextProps.project.name,
      description: nextProps.project.description,
      homepage: nextProps.project.homepage,
      projectIcon: nextProps.project.icon,
    });
  }

  saveSettings = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();

    const { saveProjectSettings, project } = this.props;
    if (!project) {
      return;
    }
    const { newName, ...metadata } = this.state;

    saveProjectSettings(newName, metadata, project);
  };

  changeMetadata = (metadata: 'newName' | 'description' | 'homepage') => (
    ev: SyntheticKeyboardEvent<*>
  ) => {
    this.setState({
      [metadata]: ev.currentTarget.value,
    });
  };

  handleKeyPress = (ev: SyntheticKeyboardEvent<*>) => {
    // When pressing the "enter" key, we want to submit the form.
    // This doesn't happen automatically because we're using buttons for the
    // project icons, and so it delegates the keypress to the first icon,
    // instead of to the submit button at the end.
    if (ev.key === 'Enter') {
      this.saveSettings(ev);
      return;
    }
  };

  updateProjectIcon = (src: string, ev) => {
    ev.preventDefault();
    this.setState(prevState => ({
      projectIcon: src,
    }));
  };

  setActive = (name: string) => {
    this.setState(state => ({
      activeField: name,
    }));
  };

  render() {
    const { hideModal, isVisible, dependenciesChangingForProject } = this.props;
    const { activeField } = this.state;
    const { projectIcon } = this.state;

    return (
      <Modal isVisible={isVisible} onDismiss={hideModal}>
        <ModalHeader title="Plugin settings" />

        <MainContent>
          <form onSubmit={this.saveSettings}>
            <FormField label="Plugin name" focusOnClick={false}>
              <TextInput
                onFocus={() => this.setActive('projectName')}
                onChange={this.changeMetadata('newName')}
                onKeyPress={this.handleKeyPress}
                value={this.state.newName}
                isFocused={activeField === 'projectName'}
                autoFocus
              />
            </FormField>

            <Spacer size={10} />

            <FormField label="Description" focusOnClick={false}>
              <TextInput
                onFocus={() => this.setActive('projectDescription')}
                onChange={this.changeMetadata('description')}
                onKeyPress={this.handleKeyPress}
                value={this.state.description}
                isFocused={activeField === 'projectDescription'}
                autoFocus
              />
            </FormField>

            <Spacer size={10} />

            <FormField label="Homage" focusOnClick={false}>
              <TextInput
                onFocus={() => this.setActive('homage')}
                onChange={this.changeMetadata('homepage')}
                onKeyPress={this.handleKeyPress}
                value={this.state.homepage}
                isFocused={activeField === 'homage'}
                autoFocus
              />
            </FormField>

            <Spacer size={10} />

            <FormField
              label="Project Icon"
              focusOnClick={false}
              isFocused={activeField === 'projectIcon'}
            >
              <ProjectIconSelection
                icon={projectIcon}
                onSelectIcon={this.updateProjectIcon}
              />
            </FormField>

            <Actions>
              <FillButton
                size="large"
                colors={[COLORS.green[700], COLORS.lightGreen[500]]}
                disabled={dependenciesChangingForProject}
              >
                Save Project
              </FillButton>

              {dependenciesChangingForProject && (
                <DisabledText>
                  Waiting for pending tasks to finish…
                </DisabledText>
              )}
            </Actions>
          </form>
        </MainContent>
      </Modal>
    );
  }
}

const MainContent = styled.section`
  padding: 25px;
`;

const Actions = styled.div`
  text-align: center;
  padding-bottom: 16px;
`;

const DisabledText = styled.div`
  padding-top: 16px;
  color: ${COLORS.gray[500]};
`;

const mapStateToProps = state => {
  const project = getSelectedProject(state);
  const projectId = project && project.id;

  const dependenciesChangingForProject = !getIsQueueEmpty(state, { projectId });

  return {
    project,
    isVisible: state.modal === 'project-settings',
    dependenciesChangingForProject,
  };
};

export default connect(
  mapStateToProps,
  {
    hideModal: actions.hideModal,
    saveProjectSettings: actions.saveProjectSettingsStart,
  }
)(ProjectConfigurationModal);
