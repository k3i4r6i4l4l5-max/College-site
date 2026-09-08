import React from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { SettingsPanel } from '../components/SettingsPanel';

export function SettingsPage(props) {
  return (
    <div className="settings-page">
      <Breadcrumb current="Настройки" />
      <SettingsPanel {...props} />
    </div>
  );
}
