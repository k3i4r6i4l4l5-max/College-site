import React from 'react';
import { Breadcrumb } from '../../../widgets/breadcrumb';
import { SettingsPanel } from './SettingsPanel';

export function SettingsPage(props) {
  return (
    <div className="settings-page">
      <Breadcrumb current="Настройки" />
      <SettingsPanel {...props} />
    </div>
  );
}
