import { expect, test } from '@playwright/test';

async function openRegisterForm(page: import('@playwright/test').Page) {
  await page.goto('http://localhost:4200');
  await page.locator('#navbarContent').getByRole('button', { name: 'Inscription' }).click();
}

function uniqueRegisterEmail(): string {
  return `register-validation-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function fillValidRegisterForm(page: import('@playwright/test').Page, email: string) {
  // Le rôle étudiant sert seulement à créer un premier compte valide pour tester l'unicité de l'e-mail.
  await page.getByText('Étudiant').click();
  await page.getByPlaceholder('Prénom').fill('Test');
  await page.getByPlaceholder('Nom', { exact: true }).fill('Validation');
  await page.getByPlaceholder('E-mail').fill(email);
  await page.getByPlaceholder('Profession').fill('Compte de test');
  await page.getByPlaceholder('Mot-de-passe').fill('password123');
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

// Vérifie qu'une inscription avec un e-mail déjà utilisé affiche une erreur visible.
test('Register with already used email should show an error alert', async ({ page }) => {
  const email = uniqueRegisterEmail();

  await test.step('Create a first account with a unique email', async () => {
    await openRegisterForm(page);
    await fillValidRegisterForm(page, email);
    await page.getByRole('main').getByRole('button', { name: "S'inscrire" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  await test.step('Try to register again with the same email', async () => {
    await openRegisterForm(page);
    await fillValidRegisterForm(page, email);
    await page.getByRole('main').getByRole('button', { name: "S'inscrire" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(
      /e-mail|email|Inscription refusée|Impossible de finaliser/i,
    );
  });
});
