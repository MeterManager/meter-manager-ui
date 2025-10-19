export const translateErrorMessage = (errorMessage) => {
  const error = String(errorMessage || '');

  if (error.includes('ResourceType with this name already exists')) {
    return 'Тип ресурсу з такою назвою вже існує.';
  }
  if (error.includes('Cannot delete active resource type')) {
    return 'Неможливо видалити активний тип ресурсу. Спочатку деактивуйте його.';
  }
  if (error.includes('ResourceType not found')) {
    return 'Тип ресурсу не знайдено.';
  }

  if (error.includes('Location with this name already exists')) {
    return 'Локація з такою назвою вже існує.';
  }
  if (error.includes('Cannot delete active location')) {
    return 'Неможливо видалити активну локацію. Спочатку деактивуйте її.';
  }
  if (error.includes('Location not found')) {
    return 'Локацію не знайдено.';
  }
  if (error.includes('Invalid tenant_id')) {
    return 'Обраний орендар недійсний або не знайдений.';
  }

  if (error.includes('already exists')) {
    return 'Елемент з такою назвою вже існує.';
  }

  if (error.includes('Failed to fetch') || error.includes('NetworkError')) {
    return "Помилка мережі. Перевірте з'єднання з Інтернетом.";
  }

  return 'Сталася непередбачена помилка. Будь ласка, спробуйте пізніше.';
};
