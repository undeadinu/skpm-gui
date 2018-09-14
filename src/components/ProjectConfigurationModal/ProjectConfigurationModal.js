// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { remote } from 'electron';
import * as fs from 'fs';

import * as actions from '../../actions';

import { COLORS } from '../../constants';
import { getSelectedProject } from '../../reducers/projects.reducer';
import { isQueueEmpty } from '../../reducers/queue.reducer';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Spacer from '../Spacer';
import { FillButton } from '../Button';
import FormField from '../FormField';
import SelectableImage from '../SelectableImage';
import TextInput from '../TextInput';

import defaultPluginIconSrc from '../../assets/images/default-plugin-icon.png';

import type { Project } from '../../types';

type Props = {
  project: Project | null,
  isVisible: boolean,
  dependenciesChangingForProject: boolean,
  hideModal: () => void,
  saveProjectSettings: (string, string, Project) => void,
};

type State = {
  newName: string,
  projectIcon: string,
  activeField: string,
};

class ProjectConfigurationModal extends PureComponent<Props, State> {
  state = {
    newName: '',
    projectIcon: '',
    activeField: 'projectName',
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.project) {
      return;
    }
    this.setState({
      newName: nextProps.project.name,
      projectIcon: nextProps.project.icon,
    });
  }

  saveSettings = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();

    const { saveProjectSettings, project } = this.props;
    if (!project) {
      return;
    }
    const { newName, projectIcon } = this.state;

    saveProjectSettings(newName, projectIcon, project);
  };

  changeProjectName = (ev: SyntheticKeyboardEvent<*>) => {
    this.setState({
      newName: ev.currentTarget.value,
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

  updateProjectIcon = ev => {
    ev.preventDefault();
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
            this.setState(prevState => ({
              projectIcon: projectIcon,
            }));
          });
        }
      }
    );
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
        <ModalHeader title="Project settings" />

        <MainContent>
          <form onSubmit={this.saveSettings}>
            <FormField label="Project name" focusOnClick={false}>
              <TextInput
                onFocus={() => this.setActive('projectName')}
                onChange={this.changeProjectName}
                onKeyPress={this.handleKeyPress}
                value={this.state.newName}
                isFocused={activeField === 'projectName'}
                autoFocus
              />
            </FormField>

            <Spacer size={10} />

            <FormField
              label="Project Icon"
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

const ProjectIconWrapper = styled.div`
  margin-top: 16px;
`;

const ProjectIconButton = styled(FillButton)`
  position: relative;
  margin-left: 20px;
  top: -24px;
`;

const Actions = styled.div`
  text-align: center;
  padding-bottom: 16px;
`;

const DisabledText = styled.div`
  padding-top: 16px;
  color: ${COLORS.gray[500]};
`;

const mapStateToProps = (state, ownProps) => {
  const project = getSelectedProject(state);
  const projectId = project && project.id;

  return {
    project,
    isVisible: state.modal === 'project-settings',
    dependenciesChangingForProject: !isQueueEmpty(state, projectId || ''),
  };
};

export default connect(
  mapStateToProps,
  {
    hideModal: actions.hideModal,
    saveProjectSettings: actions.saveProjectSettingsStart,
  }
)(ProjectConfigurationModal);
