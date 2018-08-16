// @flow
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import SortableTree from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import FileExplorerTheme from 'react-sortable-tree-theme-full-node-drag';

// import { savePluginMenu } from '../../actions';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Toggle from '../Toggle';

import type { PluginMenuRoot, PluginMenuItem, Command } from '../../types';

type Props = {
  menu: PluginMenuRoot,
  commands: Command[],
  isVisible: boolean,
  onDismiss: () => void,
  // From Redux:
  savePluginMenu: (menu: PluginMenuRoot) => any,
};

type Tree = {
  title: '-' | string,
  expanded: true,
  children?: Tree[],
};

type State = {
  isVisible: boolean,
  tree: Tree[],
  isRoot?: boolean,
};

function menuToTree(item: PluginMenuItem<Command | void>): Tree {
  if (!item) {
    return { expanded: true, title: '-- Separator --' };
  } else if (item === '-') {
    return { expanded: true, title: '-- Separator --' };
  } else if (item.title) {
    return {
      expanded: true,
      title: item.title,
      children: item.items.map(i => menuToTree(i)),
    };
  } else if (item.identifier) {
    return {
      expanded: true,
      title: item.name,
    };
  } else {
    throw new Error('impossible');
  }
}

class EditMenuModal extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isVisible: props.isVisible,
      tree: props.menu.isRoot
        ? props.menu.items.map(i => menuToTree(i))
        : [
            {
              expanded: true,
              title: props.menu.title,
              children: props.menu.items.map(i => menuToTree(i)),
            },
          ],
      isRoot: props.menu.isRoot,
    };
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.isVisible !== state.isVisible) {
      return {
        isVisible: props.isVisible,
        tree: props.menu.isRoot
          ? props.menu.items.map(i => menuToTree(i))
          : [
              {
                expanded: true,
                title: props.menu.title,
                children: props.menu.items.map(i => menuToTree(i)),
              },
            ],
        isRoot: props.menu.isRoot,
      };
    }

    return null;
  }

  handleToggleRoot = (isRoot: boolean) =>
    this.setState(state => ({
      isRoot,
      tree: isRoot
        ? state.tree[0].children
        : [
            {
              expanded: true,
              title: this.props.menu.title,
              children: state.tree,
            },
          ],
    }));
  handleTreeChange = tree => this.setState({ tree });

  renderContents() {
    const { isVisible } = this.props;
    const { isRoot, tree } = this.state;

    if (!isVisible) {
      return null;
    }

    return (
      <Fragment>
        <ModalHeader
          title="Plugin Menu"
          action={
            <Toggle
              size={32}
              isToggled={isRoot}
              onToggle={this.handleToggleRoot}
            />
          }
        />
        <MainContent>
          <SortableTree
            treeData={tree}
            onChange={this.handleTreeChange}
            theme={FileExplorerTheme}
          />
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
  height: 400px;
`;

export default connect(
  null
  // { savePluginMenu }
)(EditMenuModal);
