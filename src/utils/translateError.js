export const translateErrorMessage = (errorMessage) => {
  const error = String(errorMessage || '');

  if (error.includes('Meter with this serial number already exists')) {
    return 'Лічильник з таким серійним номером вже існує.';
  }
  if (error.includes('Meter not found')) {
    return 'Лічильник не знайдено.';
  }
  if (error.includes('Cannot create meter with inactive location')) {
    return 'Неможливо створити лічильник - локація неактивна.';
  }
  if (error.includes('Cannot create meter with inactive energy resource type')) {
    return 'Неможливо створити лічильник - тип ресурсу неактивний.';
  }
  if (error.includes('Cannot update meter with inactive location')) {
    return 'Неможливо оновити лічильник - локація неактивна.';
  }
  if (error.includes('Cannot update meter with inactive energy resource type')) {
    return 'Неможливо оновити лічильник - тип ресурсу неактивний.';
  }
  if (error.includes('Cannot delete active meter')) {
    return 'Неможливо видалити активний лічильник. Спочатку деактивуйте його.';
  }

  if (error.includes('Cannot assign inactive meter')) {
    return 'Неможливо призначити неактивний лічильник.';
  }
  if (error.includes('Cannot assign meter with inactive location')) {
    return 'Неможливо призначити лічильник з неактивною локацією.';
  }
  if (error.includes('Cannot assign meter with inactive energy resource type')) {
    return 'Неможливо призначити лічильник з неактивним типом ресурсу.';
  }
  if (error.includes('Cannot assign to inactive tenant')) {
    return 'Неможливо призначити лічильник неактивному орендарю.';
  }
  if (error.includes('Overlapping meter tenant assignment exists')) {
    return 'Для цього лічильника та орендаря вже існує призначення на цей період.';
  }
  if (error.includes('Meter tenant assignment not found')) {
    return 'Призначення лічильника орендарю не знайдено.';
  }

  if (error.includes('Overlapping tariff period exists') || error.includes('Updated period overlaps')) {
    return 'Тариф для цієї локації та ресурсу на цей період вже існує.';
  }
  if (error.includes('Tariff not found')) {
    return 'Тариф не знайдено.';
  }
  if (error.includes('location is inactive')) {
    return 'Неможливо створити/оновити тариф - локація неактивна.';
  }
  if (error.includes('energy resource type is inactive')) {
    return 'Неможливо створити/оновити тариф - тип ресурсу неактивний.';
  }
  if (error.includes('No applicable tariff found')) {
    return 'Для вказаної дати, локації та ресурсу не знайдено діючого тарифу.';
  }

  if (error.includes('ResourceType with this name already exists')) {
    return 'Тип ресурсу з такою назвою вже існує.';
  }
  if (error.includes('Cannot delete active resource type')) {
    return 'Неможливо видалити активний тип ресурсу. Спочатку деактивуйте його.';
  }
  if (error.includes('ResourceType not found') || error.includes('Energy resource type not found')) {
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

  if (error.includes('Tenant with this name already exists')) {
    return 'Орендар з такою назвою вже існує.';
  }
  if (error.includes('Cannot delete active tenant')) {
    return 'Неможливо видалити активного орендаря. Спочатку деактивуйте його.';
  }
  if (error.includes('Tenant not found')) {
    return 'Орендаря не знайдено.';
  }

  if (error.includes('already exists')) {
    return 'Елемент з такою назвою вже існує.';
  }

  if (error.includes('Failed to fetch') || error.includes('NetworkError')) {
    return "Помилка мережі. Перевірте з'єднання з Інтернетом.";
  }

  return 'Сталася непередбачена помилка. Будь ласка, спробуйте пізніше.';
};
