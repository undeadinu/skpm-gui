// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';

import SelectableItem from '../SelectableItem';
import type { Props as SelectableItemProps, Status } from '../SelectableItem';

type Props = $Rest<
  SelectableItemProps,
  {| children: (status: Status) => React$Node |}
> & {
  src: string,
};

class SelectableImage extends PureComponent<Props> {
  render() {
    const { src, ...delegated } = this.props;

    return (
      <SelectableItem {...delegated}>
        {status => <Image src={src} status={status} />}
      </SelectableItem>
    );
  }
}

const Image = styled.img`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 12.5%;
  opacity: ${props => (props.status === 'faded' ? 0.55 : 1)};
  transition: opacity 300ms;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 2px 6px 0 rgba(0, 0, 0, 0.08);
  background: white;

  &:hover {
    opacity: 1;
  }
`;

export default SelectableImage;
