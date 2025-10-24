import { pluralize } from './pluralize';

export const getDialogMessage = (action, dependencies, entity = 'location') => {
  if (entity === 'resourceType' && action === 'delete') {
    return 'Ви впевнені, що хочете видалити цей тип ресурсу? Ця дія незворотна!';
  }
  if (entity === 'delivery' && action === 'delete') {
    return 'Ви впевнені, що хочете видалити цю поставку? Ця дія незворотна!';
  }
  if (entity === 'tariff' && action === 'delete') {
    return 'Ви впевнені, що хочете видалити цей тариф? Ця дія незворотна!';
  }
  if (entity === 'meter' && action === 'delete') {
      const meterTenantCount = dependencies?.active_meter_tenants || 0;
      if (meterTenantCount > 0) {
          const tenantText = `${meterTenantCount} ${pluralize(meterTenantCount, 'активне призначення орендарю', 'активні призначення орендарям', 'активних призначень орендарям')}`;
          return `Ви впевнені, що хочете видалити цей лічильник? Це також видалить ${tenantText}. Ця дія незворотна!`;
      } else {
         return 'Ви впевнені, що хочете видалити цей лічильник? Ця дія незворотна!';
      }
  }

  const parts = [];
  const meterDependencyKey = entity === 'location' ? 'active_meters' : null;
  if (meterDependencyKey && dependencies?.[meterDependencyKey]) {
     parts.push(`${dependencies[meterDependencyKey]} ${pluralize(dependencies[meterDependencyKey], 'активний лічильник', 'активні лічильники', 'активних лічильників')}`);
  }

  if (entity === 'location' && dependencies?.deliveries) {
    parts.push(`${dependencies.deliveries} ${pluralize(dependencies.deliveries, 'поставку', 'поставки', 'поставок')}`);
  }
  if (entity === 'location' && dependencies?.active_tenants) {
    parts.push(`${dependencies.active_tenants} ${pluralize(dependencies.active_tenants, 'активного орендаря', 'активних орендарів', 'активних орендарів')}`);
  }

  if (parts.length === 0 && entity === 'location') {
    if (action === 'delete') {
      return 'Ви впевнені, що хочете видалити цю локацію? Ця дія незворотна!';
    } else {
      return 'Ви впевнені, що хочете деактивувати цю локацію?';
    }
  } else if (parts.length > 0 && entity === 'location') {
      const itemsText = parts.join(', ');
      if (action === 'delete') {
        return `Ви впевнені, що хочете видалити цю локацію? Це також видалить: ${itemsText}. Ця дія незворотна!`;
      } else {
        return `Ви впевнені, що хочете деактивувати цю локацію? Це також деактивує: ${itemsText}.`;
      }
  }

  if (action === 'delete') {
     return 'Ви впевнені, що хочете видалити цей елемент? Ця дія незворотна!';
  } else {
      return 'Ви впевнені, що хочете деактивувати цей елемент?';
  }
};
