# Guide Playwright

Ce document explique comment lancer et comprendre les tests Playwright du frontend NOVA.
Il est separe du `README.md` principal pour ne documenter que les tests end-to-end.

## Role de Playwright

Playwright sert a verifier le comportement de l'application dans un vrai navigateur.

Dans ce projet, les tests couvrent actuellement :

- l'affichage du bouton `Connexion`
- l'ouverture du formulaire de connexion
- le blocage du formulaire si les champs obligatoires sont vides
- l'erreur de connexion avec de mauvais identifiants
- la connexion reelle d'un professeur avec le backend et la base
- la connexion reelle d'un etudiant avec le backend et la base
- l'affichage du profil apres connexion
- l'affichage de la section `Mes videos`
- l'affichage de la section `Videos likees`
- le masquage des actions professeur pour un etudiant
- la deconnexion d'un professeur connecte
- la deconnexion d'un etudiant connecte
- le refus d'acces au profil pour un visiteur non connecte
- l'affichage du bouton `Inscription`
- l'ouverture du formulaire d'inscription
- la navigation depuis l'inscription vers la connexion
- le blocage du formulaire d'inscription si les champs obligatoires sont vides
- le blocage du formulaire d'inscription si l'e-mail est invalide
- l'affichage d'une alerte si l'e-mail est deja utilise
- l'inscription reelle d'un etudiant avec le backend et la base
- la connexion d'un etudiant apres son inscription
- l'inscription reelle d'un professeur avec le backend et la base
- la connexion d'un professeur apres son inscription
- la verification des droits apres inscription selon le role etudiant ou professeur
- l'acces d'un professeur a la page d'upload video
- l'upload reel d'une video par un professeur
- l'affichage de la video uploadee dans le profil professeur

## Fichiers importants

- `playwright.config.ts` : configuration Playwright
- `tests/login-test/bouton-login-professor.spec.ts` : tests de connexion generiques et profil professeur
- `tests/login-test/bouton-login-student.spec.ts` : tests de connexion et profil etudiant
- `tests/register-test/bouton-register.spec.ts` : tests du bouton et formulaire d'inscription
- `tests/register-test/register-validation.spec.ts` : tests de validation du formulaire d'inscription
- `tests/register-test/register-student.spec.ts` : tests d'inscription et connexion d'un etudiant
- `tests/register-test/register-professor.spec.ts` : tests d'inscription et connexion d'un professeur
- `tests/video-test/upload-video-professor.spec.ts` : tests d'upload video professeur
- `tests/fixtures/test-video.mp4` : petite video utilisee par les tests d'upload
- `playwright-report/` : rapport HTML genere apres execution
- `test-results/` : traces et contextes d'erreur generes par Playwright
- `tsconfig.playwright.json` : configuration TypeScript dediee a Playwright

## Prerequis

Installer les dependances du projet :

```bash
npm install
```

Installer les navigateurs Playwright si ce n'est pas deja fait :

```bash
npx playwright install
```

Demarrer le frontend Angular :

```bash
npm run start
```

Le frontend doit etre accessible sur :

```txt
http://localhost:4200
```

Pour les tests E2E reels qui se connectent a l'application, il faut aussi :

- demarrer le backend
- demarrer la base de donnees
- avoir un compte professeur existant
- avoir un compte etudiant existant
- avoir au moins les identifiants du compte professeur
- avoir au moins les identifiants du compte etudiant

## Lancer tous les tests

```bash
npx playwright test
```

Cette commande lance tous les tests dans le dossier `tests/`.

## Lancer un seul fichier de test

Connexion :

```bash
npx playwright test tests/login-test/bouton-login-professor.spec.ts --project=chromium --reporter=list
```

Connexion etudiant :

```bash
npx playwright test tests/login-test/bouton-login-student.spec.ts --project=chromium --reporter=list
```

Inscription :

```bash
npx playwright test tests/register-test/bouton-register.spec.ts --project=chromium --reporter=list
```

Upload video professeur :

```bash
npx playwright test tests/video-test/upload-video-professor.spec.ts --project=chromium --reporter=list
```

`--project=chromium` lance uniquement Chromium.

`--reporter=list` affiche les resultats clairement dans le terminal.

## Lancer Playwright en mode UI

```bash
npx playwright test --ui
```

Le mode UI permet de :

- lancer un test manuellement
- voir les actions executees
- revoir la timeline du test
- inspecter les erreurs
- consulter la console et le reseau

## Lancer le test E2E reel de connexion professeur

Le test `Professor can login and see their profile videos` utilise un vrai compte professeur.
Il ne mocke pas les appels API.

Il faut fournir les identifiants au moment de lancer la commande :

```bash
E2E_PROF_EMAIL="email-du-professeur" \
E2E_PROF_PASSWORD="mot-de-passe" \
npx playwright test tests/login-test/bouton-login-professor.spec.ts --project=chromium --reporter=list
```

Exemple :

```bash
E2E_PROF_EMAIL="prof@example.com" \
E2E_PROF_PASSWORD="1234" \
npx playwright test tests/login-test/bouton-login-professor.spec.ts --project=chromium --reporter=list
```

Ces variables evitent d'ecrire un vrai mot de passe dans le code source.

## Lancer le test E2E reel d'upload video professeur

Le fichier `tests/video-test/upload-video-professor.spec.ts` utilise un vrai compte professeur.
Il ne mocke pas les appels API.

Il faut fournir les identifiants au moment de lancer la commande :

```bash
E2E_PROF_EMAIL="email-du-professeur" \
E2E_PROF_PASSWORD="mot-de-passe" \
npx playwright test tests/video-test/upload-video-professor.spec.ts --project=chromium --reporter=list
```

Ces tests utilisent la fixture `tests/fixtures/test-video.mp4`.
Ils verifient que le professeur peut acceder au formulaire d'upload, selectionner une video valide, l'uploader, puis la retrouver dans son profil.

## Lancer le test E2E reel de connexion etudiant

Le fichier `tests/login-test/bouton-login-student.spec.ts` utilise un vrai compte etudiant.
Il ne mocke pas les appels API.

Il faut fournir les identifiants au moment de lancer la commande :

```bash
E2E_STUDENT_EMAIL="email-de-l-etudiant" \
E2E_STUDENT_PASSWORD="mot-de-passe" \
npx playwright test tests/login-test/bouton-login-student.spec.ts --project=chromium --reporter=list
```

Exemple :

```bash
E2E_STUDENT_EMAIL="student@example.com" \
E2E_STUDENT_PASSWORD="1234" \
npx playwright test tests/login-test/bouton-login-student.spec.ts --project=chromium --reporter=list
```

Ces tests verifient que l'etudiant :

- peut se connecter
- voit son profil
- voit la section `Videos likees`
- ne voit pas les actions reservees au professeur
- peut se deconnecter

## Verifier une video precise dans le profil

Si le compte professeur possede une video precise, il est possible de demander au test de verifier son titre :

```bash
E2E_PROF_EMAIL="email-du-professeur" \
E2E_PROF_PASSWORD="mot-de-passe" \
E2E_PROF_VIDEO_TITLE="Titre exact de la video" \
npx playwright test tests/login-test/bouton-login-professor.spec.ts --project=chromium --reporter=list
```

Si `E2E_PROF_VIDEO_TITLE` n'est pas fourni, le test verifie seulement que la section `Mes videos` affiche un etat coherent :

- un compteur de videos publiees
- ou le message `Aucune video enregistree pour le moment.`

Pour un compte etudiant, il est possible de verifier une video likee precise :

```bash
E2E_STUDENT_EMAIL="email-de-l-etudiant" \
E2E_STUDENT_PASSWORD="mot-de-passe" \
E2E_STUDENT_LIKED_VIDEO_TITLE="Titre exact de la video likee" \
npx playwright test tests/login-test/bouton-login-student.spec.ts --project=chromium --reporter=list
```

Si `E2E_STUDENT_LIKED_VIDEO_TITLE` n'est pas fourni, le test verifie seulement que la section `Videos likees` affiche un etat coherent :

- un compteur de videos aimees
- ou le message `Aucune video likee pour le moment.`

## Pourquoi le test professeur peut etre skipped

Le test de connexion professeur contient une protection :

```ts
test.skip(
  !professorEmail || !professorPassword,
  'Definir E2E_PROF_EMAIL et E2E_PROF_PASSWORD pour lancer ce test E2E reel.',
);
```

Cela signifie :

- si `E2E_PROF_EMAIL` manque, le test est ignore
- si `E2E_PROF_PASSWORD` manque, le test est ignore
- si les deux sont fournis, le test s'execute

Donc cette commande provoque un skip :

```bash
npx playwright test --ui
```

Cette commande lance le test reel :

```bash
E2E_PROF_EMAIL="email-du-professeur" \
E2E_PROF_PASSWORD="mot-de-passe" \
npx playwright test --ui
```

Important : si le mode UI est deja ouvert, il faut le fermer puis le relancer avec les variables.

## Lire les etapes d'un test

Dans `tests/login-test/bouton-login-professor.spec.ts` et `tests/login-test/bouton-login-student.spec.ts`, certaines parties utilisent `test.step`.

Exemple :

```ts
await test.step('Connect with professor account', async () => {
  // actions du test
});
```

Cela sert a decouper un test en etapes lisibles dans le rapport Playwright.
Un developpeur peut donc comprendre rapidement ce que le test verifie.

## Ouvrir le rapport HTML

Apres une execution, ouvrir le rapport :

```bash
npx playwright show-report
```

Le rapport permet de voir :

- les tests passes
- les tests echoues
- les tests skipped
- les captures et traces si elles existent
- les logs d'erreur

## Comprendre les messages frequents

### Test skipped

Un test skipped n'est pas forcement une erreur.

Dans ce projet, le test professeur est skipped si les variables suivantes ne sont pas fournies :

- `E2E_PROF_EMAIL`
- `E2E_PROF_PASSWORD`

### Failed to load resource: 403

Un `403` signifie que le backend refuse l'acces.

Sur l'accueil, l'application appelle le profil courant pour savoir si un utilisateur est deja connecte.
Si aucun utilisateur n'est connecte, le backend peut repondre `403`.

Ce comportement peut etre normal avant la connexion.

### Failed to load resource: ERR_CONNECTION_REFUSED

Ce message signifie que le frontend essaie d'appeler le backend, mais que le backend ne repond pas.

Ca arrive si :

- le backend n'est pas lance
- le backend n'ecoute pas sur le bon port
- le backend a crashe
- la base de donnees n'est pas disponible et empeche le backend de demarrer

Dans ce projet, le frontend appelle notamment :

```txt
http://localhost:8080/api/...
```

### Angular hydration warning NG0505

Le warning `NG0505` est lie a Angular SSR/hydration.

Il n'est pas forcement bloquant pour les tests Playwright.
Si les tests sont verts, ce warning peut etre traite separement.

## Bonnes pratiques pour ajouter des tests

- donner un nom clair au test
- utiliser les locators accessibles : `getByRole`, `getByPlaceholder`, `getByText`
- eviter les selecteurs CSS fragiles si un role accessible existe
- utiliser `test.step` pour les parcours longs
- ne pas mettre de vrais mots de passe dans le code
- utiliser des variables d'environnement pour les comptes reels
- tester un parcours nominal et au moins un cas d'erreur

## Commandes utiles

Lancer tous les tests :

```bash
npx playwright test
```

Lancer avec affichage terminal lisible :

```bash
npx playwright test --reporter=list
```

Lancer le mode UI :

```bash
npx playwright test --ui
```

Lancer uniquement Chromium :

```bash
npx playwright test --project=chromium
```

Ouvrir le rapport :

```bash
npx playwright show-report
```

Verifier le TypeScript Playwright :

```bash
npx tsc -p tsconfig.playwright.json --noEmit
```
