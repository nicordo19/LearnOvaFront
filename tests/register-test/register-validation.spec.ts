import { expect, test } from '@playwright/test';

async function openRegisterForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Inscription' }).click();
}

// Vérifie que le formulaire bloque une inscription si les champs obligatoires sont vides.
test('Register with empty required fields should keep form invalid', async ({ page }) => {
  await openRegisterForm(page);

  const firstNameInput = page.getByPlaceholder('Prénom');

  await page.getByRole('main').getByRole('button', { name: "S'inscrire" }).click();

  await expect(firstNameInput).toHaveJSProperty('validity.valueMissing', true);
  await expect(firstNameInput).not.toHaveJSProperty('validationMessage', '');
});

// Vérifie que le champ e-mail refuse un format qui n'est pas une adresse valide.
test('Register with invalid email should keep email input invalid', async ({ page }) => {
  await openRegisterForm(page);

  const emailInput = page.getByPlaceholder('E-mail');

  await page.getByText('Étudiant').click();
  await page.getByPlaceholder('Prénom').fill('Test');
  await page.getByPlaceholder('Nom', { exact: true }).fill('Validation');
  await emailInput.fill('email-invalide');
  await page.getByPlaceholder('Profession').fill('Etudiant');
  await page.getByPlaceholder('Mot-de-passe').fill('password123');
  await page.getByRole('main').getByRole('button', { name: "S'inscrire" }).click();

  await expect(emailInput).toHaveJSProperty('validity.typeMismatch', true);
  await expect(emailInput).not.toHaveJSProperty('validationMessage', '');
});

