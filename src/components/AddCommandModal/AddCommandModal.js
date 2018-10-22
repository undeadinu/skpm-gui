// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import * as actions from '../../actions';
import { COLORS } from '../../constants';
import { getSlug } from '../../utils';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Spacer from '../Spacer';
import { FillButton } from '../Button';
import FormField from '../FormField';
import TextInput from '../TextInput';

import type { Project } from '../../types';
import type { Dispatch } from '../../actions/types';

type Props = {
  isVisible: boolean,
  onDismiss: () => void,
  addCommand: Dispatch<typeof actions.addCommand>,
  project: Project,
};

type State = {
  name: string,
  identifier: string,
  isCommandNameTaken: boolean,
  activeField: string,
  shortcut: string | null,
};

class AddCommandModal extends Component<Props, State> {
  state = {
    name: '',
    identifier: '',
    activeField: 'name',
    isCommandNameTaken: false,
    shortcut: null,
  };

  addCommand = (ev: SyntheticEvent<*>) => {
    ev.preventDefault();

    const { addCommand, project, onDismiss } = this.props;

    const { name, shortcut, identifier } = this.state;

    addCommand(project, identifier, name, shortcut);
    onDismiss();
  };

  changeMetadata = (metadata: 'name') => (ev: SyntheticKeyboardEvent<*>) => {
    const { value } = ev.currentTarget;
    this.setState({
      [metadata]: value,
    });
    if (metadata === 'name') {
      this.verifyCommandNameUniqueness(value);
    }
  };

  verifyCommandNameUniqueness = (name: string) => {
    const { commands } = this.props.project;

    const slug = getSlug(name);
    this.setState({
      identifier: slug,
    });

    // Check to see if this name is already taken
    const isAlreadyTaken = !!commands.some(
      command => command.identifier === slug
    );

    if (isAlreadyTaken) {
      this.setState({ isCommandNameTaken: true });
      return;
    }

    // If this update fixes the problem, unset the error status
    if (!isAlreadyTaken && this.state.isCommandNameTaken) {
      this.setState({ isCommandNameTaken: false });
    }
  };

  handleKeyDown = (ev: SyntheticKeyboardEvent<*>) => {
    if (this.state.activeField === 'shortcut') {
      if (ev.key === 'Backspace') {
        this.setState({ shortcut: null });
        return;
      }

      if (ev.key === 'Tab') {
        return;
      }

      ev.preventDefault();

      if (
        ev.key === 'Shift' ||
        ev.key === 'Control' ||
        ev.key === 'Alt' ||
        ev.key === 'Meta'
      ) {
        return;
      }

      let shortcut = '';

      if (ev.metaKey) {
        shortcut += 'cmd+';
      }
      if (ev.ctrlKey) {
        shortcut += 'ctrl+';
      }
      if (ev.altKey) {
        shortcut += 'option+';
      }
      if (ev.shiftKey) {
        shortcut += 'shift+';
      }

      shortcut += String.fromCharCode(ev.which);

      this.setState({ shortcut });
      return;
    }
  };

  handleKeyPress = (ev: SyntheticKeyboardEvent<*>) => {
    // When pressing the "enter" key, we want to submit the form.
    // This doesn't happen automatically because we're using buttons for the
    // project icons, and so it delegates the keypress to the first icon,
    // instead of to the submit button at the end.
    if (ev.key === 'Enter') {
      this.addCommand(ev);
      return;
    }
  };

  setActive = (name: string) => {
    this.setState(state => ({
      activeField: name,
    }));
  };

  render() {
    const { isVisible, onDismiss } = this.props;
    const { activeField, name, shortcut, isCommandNameTaken } = this.state;

    return (
      <Modal
        width={620}
        height={800}
        isVisible={isVisible}
        onDismiss={onDismiss}
      >
        <Wrapper>
          <ModalHeader title="Add New Command" theme="orangeish" />

          <MainContent>
            <form onSubmit={this.addCommand}>
              <FormField
                label="Command name"
                focusOnClick={false}
                hasError={isCommandNameTaken}
              >
                <TextInput
                  onFocus={() => this.setActive('name')}
                  onChange={this.changeMetadata('name')}
                  onKeyPress={this.handleKeyPress}
                  value={name}
                  isFocused={activeField === 'name'}
                  autoFocus
                  hasError={isCommandNameTaken}
                />
                {isCommandNameTaken && (
                  <ErrorMessage>
                    Sorry, a command with this name already exists.
                  </ErrorMessage>
                )}
              </FormField>

              <Spacer size={10} />

              <FormField label="Shortcut" focusOnClick={false}>
                <TextInput
                  onFocus={() => this.setActive('shortcut')}
                  onKeyPress={this.handleKeyPress}
                  onKeyDown={this.handleKeyDown}
                  value={shortcut || ''}
                  isFocused={activeField === 'shortcut'}
                  placeholder="Record the shortcut which will trigger the command"
                />
              </FormField>

              <Actions>
                <FillButton
                  size="large"
                  colors={[COLORS.green[700], COLORS.lightGreen[500]]}
                  disabled={!name}
                >
                  Create Command
                </FillButton>
              </Actions>
            </form>
          </MainContent>
        </Wrapper>
      </Modal>
    );
  }
}

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.section`
  padding: 25px;
`;

const Actions = styled.div`
  text-align: center;
  padding-bottom: 16px;
`;

const ErrorMessage = styled.div`
  margin-top: 6px;
  color: ${COLORS.pink[700]};
`;

const mapDispatchToProps = { addCommand: actions.addCommand };

export default connect(
  undefined,
  mapDispatchToProps
)(AddCommandModal);
