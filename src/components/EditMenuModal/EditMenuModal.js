// @flow
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import {
  SortableTreeWithoutDndContext as SortableTree,
  removeNodeAtPath,
  changeNodeAtPath,
} from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import fileExplorerTheme from 'react-sortable-tree-theme-full-node-drag';

import * as actions from '../../actions';
import { getSelectedProject } from '../../reducers/projects.reducer';
import {
  rootMenuToTree,
  treeToRootMenu,
  separatorNode,
  commandNode,
  submenuNode,
  rootNode,
} from './menu-tree-translator';

import Modal from '../Modal';
import ModalHeader from '../ModalHeader';
import Toggle from '../Toggle';
import { StrokeButton, FillButton } from '../Button';
import Paragraph from '../Paragraph';
import ExternalNodeComponent, { externalNodeType } from './ItemToAdd';

import { COLORS } from '../../constants';

import type { PluginMenuRoot, Project } from '../../types';
import type { Tree } from './types';

const getNodeKey = ({ treeIndex }) => treeIndex;

type Props = {
  project?: Project,
  isVisible: boolean,
  hideModal: () => void,
  savePluginMenu: (menu: PluginMenuRoot | void, project: Project) => any,
};

type State = {
  isVisible: boolean,
  displayMenu: boolean,
  tree: Tree[],
  isRoot: boolean,
};

function getStateFromProps(props: Props) {
  if (!props.project) {
    return {
      displayMenu: false,
      isVisible: props.isVisible,
      tree: [],
      isRoot: false,
    };
  }
  const menu = props.project.pluginMenu;

  if (!menu) {
    return {
      displayMenu: false,
      isVisible: props.isVisible,
      tree: [],
      isRoot: false,
    };
  } else {
    return {
      displayMenu: true,
      isVisible: props.isVisible,
      tree: rootMenuToTree(menu),
      isRoot: !!menu.isRoot,
    };
  }
}

class EditMenuModal extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = getStateFromProps(props);
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    if (props.isVisible !== state.isVisible) {
      return getStateFromProps(props);
    }

    return null;
  }

  handleToggleDisplay = (displayMenu: boolean) =>
    this.setState({ displayMenu });

  handleToggleRoot = (isNested: boolean) => {
    const { project } = this.props;
    if (!project) {
      return;
    }
    this.setState(state => ({
      isRoot: !isNested,
      tree: !isNested
        ? state.tree[0].children
        : [
            rootNode(
              (project.pluginMenu || { title: 'My plugin' }).title,
              state.tree
            ),
          ],
    }));
  };

  handleTreeChange = tree => this.setState({ tree });

  canDrag = e => e.node.type !== 'root';

  canDrop = e =>
    (this.state.isRoot && !e.nextParent && e.node.type !== 'separator') ||
    (!!e.nextParent &&
      (e.nextParent.type === 'root' || e.nextParent.type === 'submenu'));

  renameSubmenu = ({ node, path }) => {
    const title = window.prompt('Rename the submenu', node.title);
    if (!title) {
      return;
    }
    this.setState(state => ({
      tree: changeNodeAtPath({
        treeData: state.tree,
        path,
        getNodeKey,
        newNode: {
          ...node,
          title,
        },
      }),
    }));
  };

  removeItem = ({ node, path }) => {
    this.setState(state => ({
      tree: removeNodeAtPath({
        treeData: state.tree,
        path,
        getNodeKey,
      }),
    }));
  };

  renderContents() {
    const { isVisible, project, savePluginMenu } = this.props;
    const { isRoot, tree, displayMenu } = this.state;

    if (!isVisible || !project) {
      return null;
    }

    return (
      <Fragment>
        <ModalHeader
          title="Plugin Menu"
          action={
            <FillButton
              onClick={() =>
                savePluginMenu(
                  displayMenu
                    ? treeToRootMenu(tree, project.commands)
                    : undefined,
                  project
                )
              }
              size="medium"
              colors={[COLORS.green[700], COLORS.lightGreen[500]]}
            >
              Save Menu
            </FillButton>
          }
        />
        <MainContent>
          <LeftPane>
            <Paragraph>
              Add items to the menu by dragging them to their position.
            </Paragraph>
            <Paragraph>
              <strong>A line separator</strong>
            </Paragraph>
            <ExternalNodeComponent node={separatorNode()} />
            <Paragraph>
              <strong>A submenu</strong>
            </Paragraph>
            <ExternalNodeComponent
              editable
              node={submenuNode('Click to rename me', [])}
            />
            <Paragraph>
              <strong>An item which triggers the command when clicked</strong>
            </Paragraph>
            {project.commands.map(command => (
              <ExternalNodeComponent
                key={command.identifier}
                node={commandNode(command)}
              />
            ))}
          </LeftPane>
          <RightPane>
            <Setting>
              Display a menu in the "Plugins" menu of Sketch
              <Toggle
                size={16}
                isToggled={displayMenu}
                onToggle={this.handleToggleDisplay}
              />
            </Setting>
            <Setting>
              Keep the plugin menu in its own menu
              <Toggle
                size={16}
                isToggled={!isRoot}
                onToggle={this.handleToggleRoot}
              />
            </Setting>
            <SortableTree
              treeData={tree}
              onChange={this.handleTreeChange}
              dndType={externalNodeType}
              theme={fileExplorerTheme}
              canDrag={this.canDrag}
              canDrop={this.canDrop}
              generateNodeProps={({ node, path }) => ({
                buttons: [
                  // node.type === 'submenu' ? (
                  //   <StrokeButton
                  //     size="xsmall"
                  //     onClick={() => this.renameSubmenu({ node, path })}
                  //   >

                  //   </StrokeButton>
                  // ) : null,
                  node.type !== 'root' ? (
                    <StrokeButton
                      title="Remove"
                      size="xsmall"
                      strokeColors={['#FFFFFF']}
                      onClick={() => this.removeItem({ node, path })}
                    >
                      🗑
                    </StrokeButton>
                  ) : null,
                ],
              })}
            />
          </RightPane>
        </MainContent>
      </Fragment>
    );
  }
  render() {
    const { isVisible, hideModal } = this.props;

    return (
      <Modal width={680} isVisible={isVisible} onDismiss={hideModal}>
        {this.renderContents()}
      </Modal>
    );
  }
}
const MainContent = styled.section`
  padding: 25px;
  height: 500px;
  display: flex;
  flex-direction: row;
`;

const LeftPane = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% + 50px);
  border-bottom-left-radius: 8px;
  width: 280px;
  margin-top: -25px;
  margin-left: -25px;
  padding: 25px;
  color: ${COLORS.white};
  background-image: linear-gradient(
    70deg,
    ${COLORS.orange[700]},
    ${COLORS.yellow[500]}
  );
  overflow: scroll;
`;

const RightPane = styled.div`
  height: calc(100% + 25px);
  margin-right: -25px;
  width: calc(100% - 230px);
  margin-bottom: -25px;
`;

const Setting = styled.div`
  display: flex;
  margin-top: -10px;
  margin-bottom: 15px;
  padding-left: 15px;
  padding-right: 15px;
  justify-content: space-between;
`;

const mapStateToProps = state => {
  const project = getSelectedProject(state);

  return {
    project,
    isVisible: state.modal === 'plugin-menu',
  };
};
export default connect(
  mapStateToProps,
  { savePluginMenu: actions.savePluginMenuStart, hideModal: actions.hideModal }
)(EditMenuModal);
