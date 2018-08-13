// @flow
import React from 'react';
import styled from 'styled-components';

import { COLORS } from '../../constants';

import SelectableImage from '../SelectableImage';
import SelectableItem from '../SelectableItem';

type Props = {
  id: string,
  size: number,
  name: string,
  iconSrc?: string,
  isSelected: boolean,
};

const SidebarProjectIcon = ({ id, size, name, iconSrc, isSelected }: Props) => {
  if (!iconSrc) {
    return (
      <SelectableItem
        size={size}
        color1={COLORS.white}
        color2={COLORS.white}
        status={isSelected ? 'highlighted' : 'faded'}
      >
        {status => (
          <ProjectNameIcon
            style={{ opacity: status === 'highlighted' ? 1 : 0.55 }}
          >
            {name.slice(0, 1).toUpperCase()}
          </ProjectNameIcon>
        )}
      </SelectableItem>
    );
  }
  return (
    <SelectableImage
      src={`data:image/png;base64, ${iconSrc}`}
      size={size}
      color1={COLORS.white}
      color2={COLORS.white}
      status={isSelected ? 'highlighted' : 'faded'}
    />
  );
};

const ProjectNameIcon = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  background: white;
  color: ${COLORS.orange[500]};
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  border-radius: 12.5%;
`;

export default SidebarProjectIcon;
