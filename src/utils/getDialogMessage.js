import { pluralize } from './pluralize';

export const getDialogMessage = (action, dependencies, entity = 'location') => {
  if (entity === 'resourceType' && action === 'delete') {
    return 'Ви впевнені, що хочете видалити цей тип ресурсу? Ця дія незворотна!';
  }

  const parts = [];
  if (dependencies?.active_meters) {
    parts.push(`${dependencies.active_meters} ${pluralize(dependencies.active_meters, 'активний лічильник', 'активні лічильники', 'активних лічильників')}`);
  }
  if (dependencies?.deliveries) {
    parts.push(`${dependencies.deliveries} ${pluralize(dependencies.deliveries, 'поставку', 'поставки', 'поставок')}`);
  }
  if (dependencies?.active_tenants) {
    parts.push(`${dependencies.active_tenants} ${pluralize(dependencies.active_tenants, 'активного орендаря', 'активних орендарів', 'активних орендарів')}`);
  }

  if (parts.length === 0) {
    return action === 'delete'
      ? 'Ви впевнені, що хочете видалити цю локацію? Ця дія незворотна!'
      : 'Ви впевнені, що хочете деактивувати цю локацію?';
  }

  const itemsText = parts.join(', ');
  return action === 'delete'
    ? `Ви впевнені, що хочете видалити цю локацію? Це також видалить: ${itemsText}. Ця дія незворотна!`
    : `Ви впевнені, що хочете деактивувати цю локацію? Це також деактивує: ${itemsText}.`;
};
