import React from 'react';
import useSettingState from '../../../../hooks/useSettingState';
import { Switch } from '@mantine/core';

const NAME = 'Send Snaps as Mobile';
const DESCRIPTION = 'Snaps sent will appear sent from Mobile.';

function SnapAsMobile() {
  const [enabled, setEnabled] = useSettingState('SNAP_AS_MOBILE');
  return <Switch label={NAME} description={DESCRIPTION} checked={enabled} onChange={() => setEnabled(!enabled)} />;
}

export default {
  name: NAME,
  description: DESCRIPTION,
  component: SnapAsMobile,
};
