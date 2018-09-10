// @flow
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import SortableTree, {
  removeNodeAtPath,
  changeNodeAtPath,
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import fileExplorerTheme from 'react-sortable-tree-theme-full-node-drag';

// import { savePluginMenu } from '../../actions';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Toggle from '../Toggle';
import { FillButton } from '../Button';

import type { PluginMenuRoot, PluginMenuItem, Command } from '../../types';

const getNodeKey = ({ treeIndex }) => treeIndex;

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
  type: 'separator' | 'submenu' | 'root' | 'command',
};

type State = {
  isVisible: boolean,
  tree: Tree[],
  isRoot: boolean,
};

function menuToTree(item: PluginMenuItem<Command | void>): Tree {
  if (!item) {
    return { expanded: true, title: '-- Separator --', type: 'separator' };
  } else if (item === '-') {
    return { expanded: true, title: '-- Separator --', type: 'separator' };
  } else if (item.title) {
    return {
      expanded: true,
      title: item.title,
      children: item.items.map(i => menuToTree(i)),
      type: 'submenu',
    };
  } else if (item.identifier) {
    return {
      expanded: true,
      title: item.name,
      type: 'command',
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
              type: 'root',
            },
          ],
      isRoot: !!props.menu.isRoot,
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
                type: 'root',
              },
            ],
        isRoot: !!props.menu.isRoot,
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
              type: 'root',
            },
          ],
    }));

  handleTreeChange = tree => this.setState({ tree });

  addSubmenu = () =>
    this.setState(state => ({
      tree: state.isRoot
        ? [
            ...state.tree,
            {
              expanded: true,
              title: 'Click to rename me',
              children: [],
              type: 'submenu',
            },
          ]
        : [
            {
              ...state.tree[0],
              children: [
                ...(state.tree[0].children || []),
                {
                  expanded: true,
                  title: 'Click to rename me',
                  children: [],
                  type: 'submenu',
                },
              ],
            },
          ],
    }));

  addSeparator = () =>
    this.setState(state => ({
      tree: state.isRoot
        ? [
            ...state.tree,
            { expanded: true, title: '-- Separator --', type: 'separator' },
          ]
        : [
            {
              ...state.tree[0],
              children: [
                ...(state.tree[0].children || []),
                { expanded: true, title: '-- Separator --', type: 'separator' },
              ],
            },
          ],
    }));

  addCommand = () =>
    this.setState(state => ({
      tree: state.isRoot
        ? [
            ...state.tree,
            {
              expanded: true,
              title: 'Click to rename me',
              children: [],
              type: 'submenu',
            },
          ]
        : [
            {
              ...state.tree[0],
              children: [
                ...(state.tree[0].children || []),
                {
                  expanded: true,
                  title: 'Click to rename me',
                  children: [],
                  type: 'submenu',
                },
              ],
            },
          ],
    }));

  canDrag = e => e.node.type !== 'root';

  canDrop = e =>
    (this.state.isRoot && !e.nextParent && e.node.type !== 'separator') ||
    (!!e.nextParent &&
      (e.nextParent.type === 'root' || e.nextParent.type === 'submenu'));

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
            theme={fileExplorerTheme}
            canDrag={this.canDrag}
            canDrop={this.canDrop}
            generateNodeProps={({ node, path }) => ({
              buttons: [
                node.type === 'submenu' ? (
                  <FillButton
                    size="xsmall"
                    onClick={() =>
                      this.setState(state => ({
                        tree: changeNodeAtPath({
                          treeData: state.tree,
                          path,
                          getNodeKey,
                          newNode: {
                            ...node,
                            title: 'updated',
                          },
                        }),
                      }))
                    }
                  >
                    Edit
                  </FillButton>
                ) : null,
                node.type !== 'root' ? (
                  <FillButton
                    size="xsmall"
                    onClick={() =>
                      this.setState(state => ({
                        tree: removeNodeAtPath({
                          treeData: state.tree,
                          path,
                          getNodeKey,
                        }),
                      }))
                    }
                  >
                    Remove
                  </FillButton>
                ) : null,
              ],
            })}
          />
          <FillButton onClick={this.addSubmenu}>Add a submenu</FillButton>
          <FillButton onClick={this.addSeparator}>Add a separator</FillButton>
          <FillButton onClick={this.addCommand}>Add a command</FillButton>
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
