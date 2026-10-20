// Validation des entrées. Retourne { errors: [{field, message}], value }.
function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}

function validateProduct(body) {
  const errors = [];
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) errors.push({ field: 'name', message: 'Le nom est obligatoire' });
  else if (name.length > 150) errors.push({ field: 'name', message: 'Le nom ne doit pas dépasser 150 caractères' });

  let description = b.description == null ? '' : b.description;
  if (typeof description !== 'string') {
    errors.push({ field: 'description', message: 'La description doit être une chaîne de caractères' });
    description = '';
  } else if (description.length > 5000) {
    errors.push({ field: 'description', message: 'La description ne doit pas dépasser 5000 caractères' });
  }

  const price = toNumber(b.price);
  if (!Number.isFinite(price) || price < 0 || price > 99999999.99) {
    errors.push({ field: 'price', message: 'Le prix doit être un nombre positif' });
  }

  const category = typeof b.category === 'string' ? b.category.trim() : '';
  if (!category) errors.push({ field: 'category', message: 'La catégorie est obligatoire' });
  else if (category.length > 80) errors.push({ field: 'category', message: 'La catégorie ne doit pas dépasser 80 caractères' });

  let image_url = b.image_url == null ? '' : b.image_url;
  if (typeof image_url !== 'string') {
    errors.push({ field: 'image_url', message: "L'URL de l'image doit être une chaîne de caractères" });
    image_url = '';
  } else {
    image_url = image_url.trim();
    if (image_url.length > 500) errors.push({ field: 'image_url', message: "L'URL de l'image est trop longue (500 max)" });
    else if (image_url && !/^(https?:\/\/|\/)/i.test(image_url)) {
      errors.push({ field: 'image_url', message: "L'image doit être une URL http(s) ou un chemin commençant par /" });
    }
  }

  const stock = toNumber(b.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 2147483647) {
    errors.push({ field: 'stock', message: 'Le stock doit être un entier positif ou nul' });
  }

  return {
    errors,
    value: { name, description, price, category, image_url: image_url || null, stock },
  };
}

function parseId(param) {
  if (!/^\d+$/.test(String(param))) return null;
  const id = Number(param);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

module.exports = { validateProduct, parseId };
