// @flow
import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import { action } from '@storybook/addon-actions';

import Showcase from '../../../.storybook/components/Showcase';
import ProjectIconSelection from './ProjectIconSelection';

storiesOf('ProjectIconSelection', module).add(
  'default',
  withInfo()(() => (
    <Fragment>
      <Showcase label="Image selected">
        <ProjectIconSelection
          icon="/static/media/icon_pineapple.5d31b188.jpg"
          onSelectIcon={action('click')}
        />
      </Showcase>
      <Showcase label="Show the default plugin icon">
        <ProjectIconSelection icon={null} onSelectIcon={action('click')} />
      </Showcase>
    </Fragment>
  ))
);
