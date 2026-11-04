# 📂 Pizzaro Project File Directory & Architecture Guide

Gabay ito sa buong Pizzaro web application para sa code walkthrough, project demo, at defense. Inililista nito ang application files sa repository root, `backend/`, at `frontend/`, kasama ang configuration, test files, at static assets.

> **Scope:** Kasama rito ang app/runtime at project configuration files. Hindi kasama ang `.git/`, `node_modules/`, generated build output gaya ng `dist/`, at local AI/editor design skill bundles sa `.agent/`, `.agents/`, `.codex/`, at `.taste-skill/`; hindi sila ginagamit ng Pizzaro runtime at may sarili silang documentation. Hindi rin inilalagay rito ang nilalaman ng secret files.
>
> Ang `backend/config/.env` at `frontend/.env` ay configuration files lamang: huwag i-print, i-screenshot, i-commit, o ipasa ang kanilang values. May credentials na na-expose sa naunang IDE selection/chat; i-rotate ang mga iyon sa provider consoles at palitan sa local environment files. Sa kasalukuyang repository inventory, lumalabas ang `frontend/.env` sa tracked-file list; kung may laman itong live configuration, alisin ito sa Git tracking at i-rotate ang anumang exposed credentials. Ang line numbers at implementation ay maaaring magbago habang nag-e-edit.

## 🧭 System architecture sa madaling sabi

1. **Frontend:** React app sa Vite. Ang `App.jsx` ang nagse-set up ng routes at shared page layout.
2. **Shared state:** Redux store ang may product, user, cart, at order state; Redux Thunk actions ang tumatawag sa API.
3. **Backend:** Express routes ang tumatanggap ng HTTP requests; middleware ang nagve-verify ng session at role; controllers ang nagpapatakbo ng business rules.
4. **Database at external services:** Mongoose models ang MongoDB schema. Cloudinary ang image storage, Firebase ang social sign-in verification, SMTP/Nodemailer ang email, at PDFKit ang receipt.
5. **Security:** Authentication cookie ang karaniwang session mechanism. Admin-only routes ay may role check. Order totals at stock ay muling vine-validate sa server.

Walang hiwalay na `pages/`, `context/`, o Redux Toolkit `slices/` folder sa project na ito. Ang page components ay nasa `frontend/src/Components/`, at ang Redux setup ay nasa `store.js`, `actions/`, `reducers/`, at `constants/`.

---

# Root project files

Ang root folder ang naglalaman ng workspace-level dependencies, lockfile, project documentation, at ignore rules.

### 📄 `package.json`
- **📌 Ano ang laman nito:** Root npm manifest; kasalukuyang nagdedeklara ito ng Redux dependency.
- **⚙️ Paano ito gumagana:** Ginagamit ito ng npm kapag nag-i-install ng root dependencies. Hiwalay ang manifests ng backend at frontend para sa kani-kanilang application packages.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang root package manifest; hiwalay ang backend at frontend dependencies sa sarili nilang package files.”*

### 📄 `package-lock.json`
- **📌 Ano ang laman nito:** Naka-lock na dependency tree para sa root npm install.
- **⚙️ Paano ito gumagana:** Tinutulungan nitong ulitin ang parehong dependency resolution sa susunod na install.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, lockfile po ito para maging consistent ang pag-install ng root dependencies.”*

### 📄 `skills-lock.json`
- **📌 Ano ang laman nito:** Lock metadata para sa workspace design skill; hindi ito application configuration.
- **⚙️ Paano ito gumagana:** Ginagamit ito ng development tooling para matukoy ang skill source/version metadata, hindi ng storefront o API.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, development-tool metadata lang po ito at hindi kasama sa runtime ng Pizzaro.”*

### 📄 `.gitignore`
- **📌 Ano ang laman nito:** Mga path pattern para sa dependencies, build/test output, local environment files, at logs.
- **⚙️ Paano ito gumagana:** Pinipigilan nitong maisama sa Git ang mga file na dapat manatiling local o generated. Dapat ding tiyaking hindi kailanman naka-track ang secret files.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po nakalista ang mga local secrets, dependencies, at generated files na hindi dapat i-commit.”*

### 📄 `README.md`
- **📌 Ano ang laman nito:** Functional requirements walkthrough batay sa 220-point rubric, demo sequence, setup notes, at reusable audit prompt.
- **⚙️ Paano ito gumagana:** Rubric-oriented companion guide ito; ang detalyadong file-by-file architecture ay nasa `PROJECT_STRUCTURE.md`.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, itong README po ang requirements checklist at demo guide; ang file-by-file system map naman ay nasa PROJECT_STRUCTURE.”*

### 📄 `PROJECT_STRUCTURE.md`
- **📌 Ano ang laman nito:** Ang kasalukuyang system architecture at catalog ng application folders/files.
- **⚙️ Paano ito gumagana:** Bawat entry ay naglalarawan ng file purpose, role sa system, at demo explanation. Secret values ay sadyang hindi kasama rito.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang architecture guide na nagpapakita kung paano magkakaugnay ang frontend, backend, database, at integrations.”*

### 📄 `.codex/hooks.json`
- **📌 Ano ang laman nito:** Workspace automation hook configuration para sa development tooling.
- **⚙️ Paano ito gumagana:** Tooling lamang ang bumabasa rito; hindi ito route, React component, o backend business logic.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, optional developer-tool configuration lang po ito at walang epekto sa normal na paggamit ng web app.”*

---

# `backend/`

Ang `backend/` ang Express API at business-logic layer. Dito nakalagay ang authentication, authorization, MongoDB models, order/product controllers, integrations, tests, at server startup.

## `backend/` root files

### 📄 `backend/app.js`
- **📌 Ano ang laman nito:** Express app setup, CORS, cookie parser, JSON/urlencoded body parsers, route mounting, at global error middleware.
- **⚙️ Paano ito gumagana:** Inaayos nito ang middleware bago i-mount ang `/api/v1` routes. Ang huling error handler ay nagbabalik ng JSON error response; nakatakda pa sa localhost ang CORS origin.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang API application setup: dito nakakabit ang middleware, routes, CORS, at centralized error handling.”*

### 📄 `backend/server.js`
- **📌 Ano ang laman nito:** Dotenv loading, Cloudinary configuration, database connection, menu seeding, at HTTP server startup.
- **⚙️ Paano ito gumagana:** Kumokonekta muna sa database at nagsi-seed ng menu bago magsimulang tumanggap ng requests ang server.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang backend entry point; kinokonekta muna nito ang database at sine-seed ang menu bago mag-listen ang API.”*

### 📄 `backend/package.json`
- **📌 Ano ang laman nito:** Backend dependencies at `start`/`test` scripts.
- **⚙️ Paano ito gumagana:** Nagbibigay ang `npm start` ng Nodemon development server at `npm test` ng Node test runner. Dependencies nito ang Express, Mongoose, Firebase Admin, Cloudinary, Nodemailer, PDFKit, at `bad-words`.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-declare ang backend libraries at commands para magpatakbo ng server at tests.”*

### 📄 `backend/package-lock.json`
- **📌 Ano ang laman nito:** Eksaktong resolved backend dependency versions.
- **⚙️ Paano ito gumagana:** Ginagamit ng npm para sa repeatable dependency installation.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, lockfile po ito ng backend packages para consistent ang installation.”*

### 📄 `backend/env.txt`
- **📌 Ano ang laman nito:** Legacy/sample list ng backend environment setting names at placeholder values.
- **⚙️ Paano ito gumagana:** Reference lamang ito; hindi ito ang environment file na nilo-load ng server. Ang aktuwal na local configuration ay nasa `backend/config/.env`.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, sample reference lang po ito; ang server ay naglo-load ng config file sa backend/config.”*

## `backend/config/`

Configuration modules ang laman nito: MongoDB connection, Firebase Admin, at local environment settings.

### 📄 `backend/config/.env`
- **📌 Ano ang laman nito:** Local runtime configuration para sa database, JWT/cookie, Cloudinary, SMTP, Firebase Admin, port, at environment mode. Hindi inilalantad ng guide na ito ang values.
- **⚙️ Paano ito gumagana:** Binabasa ng backend startup ang environment settings; ginagamit ng bawat integration ang nararapat na variable. Dapat local/ignored ito at hindi ipasa sa Git o screenshots.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-configure ang local services gamit ang environment variables; hindi ipinapakita o kino-commit ang secret values.”*

### 📄 `backend/config/.env.example`
- **📌 Ano ang laman nito:** Safe template ng ilan sa backend environment variable names at walang aktuwal na credential values.
- **⚙️ Paano ito gumagana:** Kinokopya bilang panimulang template sa local environment at pinupunan nang pribado.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, template po ito ng backend environment settings; dito makikita kung anong configuration ang kailangan nang hindi naglalantad ng secrets.”*

### 📄 `backend/config/database.js`
- **📌 Ano ang laman nito:** `connectDatabase()` at optional DNS server configuration para sa MongoDB connection.
- **⚙️ Paano ito gumagana:** Kumokonekta ang Mongoose gamit ang `DB_URI`; maaari ring gumamit ng custom DNS servers kapag naka-configure.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po kinokonekta ng Mongoose ang API sa MongoDB gamit ang database URI mula sa environment.”*

### 📄 `backend/config/firebaseAdmin.js`
- **📌 Ano ang laman nito:** Lazy Firebase Admin initialization at `getFirebaseAuth()` export.
- **⚙️ Paano ito gumagana:** Kinukuha ang Firebase service-account settings mula sa environment at ini-initialize ang Admin SDK kapag kailangan ng token verification.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ini-initialize ang Firebase Admin nang ligtas mula sa server environment para ma-verify ang social-login tokens.”*

## `backend/controllers/`

Ang controllers ang tumatanggap ng validated route request, nagpapatakbo ng business logic/model operations, at bumubuo ng HTTP response.

### 📄 `backend/controllers/auth.js`
- **📌 Ano ang laman nito:** Registration, login, Firebase social login, password recovery/reset/update, profile, user administration, at logout handlers.
- **⚙️ Paano ito gumagana:** Gumagamit ito ng User model, JWT cookie helper, password hashing/verification, Firebase token verification, email service, at input validation. Admin user-management endpoints ay protektado rin ng routes/middleware.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang authentication at account logic—mula register/login hanggang password reset, profile, at Firebase social login.”*

### 📄 `backend/controllers/order.js`
- **📌 Ano ang laman nito:** Order creation, user/admin order lookup, status update, inventory adjustment, email template, PDF attachment, at sales analytics handlers.
- **⚙️ Paano ito gumagana:** Kinukuha uli sa database ang presyo at stock sa checkout para hindi magtiwala sa client totals. Sa status update, ina-adjust ang inventory, itinatala ang completion date, ipinapadala ang customer email, at ina-aggregate ang completed-order sales.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-centralize ang order lifecycle: server-side checkout validation, admin status updates, inventory, customer email/receipt, at analytics.”*

### 📄 `backend/controllers/product.js`
- **📌 Ano ang laman nito:** Product CRUD, storefront catalog/filtering/pagination, multi-image upload orchestration, review CRUD/moderation, profanity filter, at product-sales aggregation.
- **⚙️ Paano ito gumagana:** Gumagamit ito ng Product/Order models, API feature helper, Cloudinary image utilities, at `bad-words`. Bago gumawa ng bagong review, tinitingnan nito kung may completed/delivered order ang user na naglalaman ng product.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang product catalog logic—CRUD, filtering, pagination, images, ratings, review authorization, at moderation.”*

## `backend/middleware/`

Ang middleware ay mga request checks na tumatakbo bago ang controller.

### 📄 `backend/middleware/auth.js`
- **📌 Ano ang laman nito:** `isAuthenticatedUser` cookie/JWT guard at `authorizeRoles(...roles)` role guard.
- **⚙️ Paano ito gumagana:** Vine-verify ang JWT cookie, hinahanap ang user, at inilalagay ito sa `req.user`. Pagkatapos, role middleware ang naglilimita sa admin-only endpoints.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, bago makarating sa protected controller, dito chine-check ang session cookie at kung may tamang role ang user.”*

## `backend/models/`

Mongoose schemas ang nagtatakda ng database document fields, validation, defaults, at relationships.

### 📄 `backend/models/user.js`
- **📌 Ano ang laman nito:** User schema, password hashing hook, JWT/reset-token methods, at password comparison.
- **⚙️ Paano ito gumagana:** Hinahash ng bcrypt ang password bago i-save; Firebase users ay maaaring walang local password. May role, avatar, contact/profile fields, at social-auth identifiers.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang User schema at account security methods para sa password, session token, at social identity.”*

### 📄 `backend/models/product.js`
- **📌 Ano ang laman nito:** Product fields, pizza-only category enum, stock/price validation, image array, ratings, at embedded reviews.
- **⚙️ Paano ito gumagana:** Mongoose validators ang nagtatakda ng allowed name, price, description, stock, image count, pizza categories, at review structure bago ma-save.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-define ang product data at database-level validation para sa presyo, stock, categories, photos, at reviews.”*

### 📄 `backend/models/order.js`
- **📌 Ano ang laman nito:** Shipping, user reference, order line items, totals, status, inventory flag, email-notification status, completion date, at timestamps.
- **⚙️ Paano ito gumagana:** Schema validation ang kumokontrol sa allowed order statuses at nagtatala ng state para sa order lifecycle. Walang payment-method fields dahil hindi ito requirement.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang order record—kasama ang line items, totals, status, completion date, at inventory tracking.”*

## `backend/routes/`

Ang route files ang nagmamapa ng HTTP method/path sa controller at naglalagay ng authentication/role guards.

### 📄 `backend/routes/auth.js`
- **📌 Ano ang laman nito:** Register/login/logout, profile, password, at admin user route mappings.
- **⚙️ Paano ito gumagana:** Ikinakabit nito ang auth controller handlers; gumagamit ng authentication at admin role middleware ang protected endpoints.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po makikita ang authentication API endpoints at kung alin ang nangangailangan ng login o admin access.”*

### 📄 `backend/routes/socialAuth.js`
- **📌 Ano ang laman nito:** `POST /social-login` route.
- **⚙️ Paano ito gumagana:** Ipinapasa ang Firebase ID token mula frontend sa social login controller para ma-verify at ma-session ang user.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang endpoint na tumatanggap ng Firebase social-login token para i-verify sa server.”*

### 📄 `backend/routes/product.js`
- **📌 Ano ang laman nito:** Public product listing/details at admin product CRUD, image upload, bulk delete, review, moderation, at sales routes.
- **⚙️ Paano ito gumagana:** Pinoprotektahan ng authentication/admin middleware ang mga write/moderation/admin endpoints; public ang storefront catalog endpoints.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-map ang product at review API; makikita rin ang admin-only protection para sa management actions.”*

### 📄 `backend/routes/order.js`
- **📌 Ano ang laman nito:** Create/view orders, customer order list, admin order list/update/delete, at admin sales endpoints.
- **⚙️ Paano ito gumagana:** Login ang kailangan para sa customer order endpoints; admin role ang kailangan sa management at analytics routes.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang order API routes, kasama ang customer order history at admin fulfillment/analytics endpoints.”*

## `backend/seeds/`

Seed data ang laman nito para maihanda ang menu catalog.

### 📄 `backend/seeds/menuProducts.js`
- **📌 Ano ang laman nito:** `menuProducts`, pizza category set, at `seedMenuProducts()` function.
- **⚙️ Paano ito gumagana:** Inaalis nito ang legacy/non-pizza records na hindi na kabilang sa menu at nag-i-upsert ng default menu products gamit ang local public image paths.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-define at nase-seed ang starter pizza menu para may catalog ang bagong database.”*

## `backend/test/`

Automated Node test runner cases ang laman nito para sa product validations, lifecycle rules, at receipt output.

### 📄 `backend/test/orderLifecycle.test.js`
- **📌 Ano ang laman nito:** Test para sa review-eligibility query.
- **⚙️ Paano ito gumagana:** Tinitiyak ng assertion na completed/delivered order na naglalaman ng product at pagmamay-ari ng customer ang kailangan para maging eligible ang review.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, automated test po ito para matiyak na completed transaction lang ng customer ang nagbibigay ng review eligibility.”*

### 📄 `backend/test/productValidation.test.js`
- **📌 Ano ang laman nito:** Product schema validation tests, pizza-only category check, filter query tests, escaped search, at pagination tests.
- **⚙️ Paano ito gumagana:** Sinusubukan ang valid/invalid category, price, stock, image count, filter composition, at page skip/limit behavior.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po chine-check ng tests ang pizza category restriction, product validation, advanced filters, search safety, at pagination logic.”*

### 📄 `backend/test/receipt.test.js`
- **📌 Ano ang laman nito:** PDF receipt generation test.
- **⚙️ Paano ito gumagana:** Gumagawa ng sample order receipt at tinitiyak na valid PDF buffer na may PDF header ang output.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, test po ito na nagpapatunay na nakakagawa ang receipt generator ng PDF output.”*

## `backend/utils/`

Reusable backend helpers para sa query features, uploads, token responses, email, PDF, at order rules.

### 📄 `backend/utils/apiFeatures.js`
- **📌 Ano ang laman nito:** `APIFeatures` class na may `search()`, `filter()`, at `pagination()`.
- **⚙️ Paano ito gumagana:** Binubuo nito ang MongoDB search/filter conditions para sa keyword, price, category, rating, reviews, at page limit/offset.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable query helper po ito para hindi maulit ang search, filtering, at pagination logic sa catalog.”*

### 📄 `backend/utils/productImages.js`
- **📌 Ano ang laman nito:** Image size/count constants at upload, delete, at rollback helpers para sa Cloudinary.
- **⚙️ Paano ito gumagana:** Ina-upload ang file/data URL at tinatanggal ang orphaned images kapag pumalya ang product save o may cleanup.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-isolate ang Cloudinary image upload at cleanup para hindi magkalat ang file operations sa controller.”*

### 📄 `backend/utils/multer.js`
- **📌 Ano ang laman nito:** Multer middleware na naglilimita sa image file type, file size, at upload count.
- **⚙️ Paano ito gumagana:** Sinusuri nito ang extension at MIME type bago ipasa ang temporary file sa product/avatar upload route.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, bago iproseso ang image upload, dito nililimitahan at chine-check ang file type at laki.”*

### 📄 `backend/utils/orderLifecycle.js`
- **📌 Ano ang laman nito:** `reviewableOrderFilter(userId, productId)` helper.
- **⚙️ Paano ito gumagana:** Binubuo nito ang query na naglilimita sa review eligibility sa sariling completed/delivered order ng user na naglalaman ng product.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, shared rule po ito para matiyak na completed transaction ng customer ang kailangan bago makapag-review.”*

### 📄 `backend/utils/jwtToken.js`
- **📌 Ano ang laman nito:** `sendToken()` helper para mag-sign ng JWT at mag-set ng HTTP-only cookie response.
- **⚙️ Paano ito gumagana:** Gumagamit ito ng environment expiry settings at nagtatakda ng secure/same-site cookie options ayon sa environment.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable helper po ito para magbalik ng login response at secure cookie pagkatapos ng authentication.”*

### 📄 `backend/utils/sendEmail.js`
- **📌 Ano ang laman nito:** Nodemailer transport setup at `sendEmail()` export.
- **⚙️ Paano ito gumagana:** Kinukuha ang SMTP settings sa environment at nagpapadala ng text/HTML email na maaaring may attachments.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po dumadaan ang outgoing email para sa order notification at password recovery.”*

### 📄 `backend/utils/generateReceipt.js`
- **📌 Ano ang laman nito:** PDFKit receipt renderer at currency formatter.
- **⚙️ Paano ito gumagana:** Bumubuo ito ng in-memory PDF na may order/customer details, item rows, subtotals, tax, shipping, at grand total.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po dynamic na ginagawa ang PDF receipt mula sa order record bago ikabit sa email.”*

---

# `frontend/`

Ang `frontend/` ang React/Vite client app. Dito nakalagay ang pages/screens, reusable UI components, Redux state, validation schemas, static assets, at client configuration.

## `frontend/` root files

### 📄 `frontend/.env`
- **📌 Ano ang laman nito:** Local Vite API address at Firebase browser configuration values. Hindi ipinapakita rito ang values.
- **⚙️ Paano ito gumagana:** Exposed sa browser bundle ang mga `VITE_` variables; huwag maglagay rito ng server secrets o Firebase Admin private key. Suriin na hindi naka-commit ang local values.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang local frontend endpoints at Firebase client configuration; server-side secrets ay sa backend environment lamang.”*

### 📄 `frontend/.gitignore`
- **📌 Ano ang laman nito:** Frontend-specific ignore rules para sa dependencies, local files, at build output.
- **⚙️ Paano ito gumagana:** Ginagamit ito ng Git para hindi maisama ang generated Vite artifacts at local files.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, frontend ignore rules po ito para hindi ma-commit ang generated files at local-only configuration.”*

### 📄 `frontend/package.json`
- **📌 Ano ang laman nito:** Frontend scripts, dependencies, at devDependencies.
- **⚙️ Paano ito gumagana:** Nagbibigay ito ng `dev`, `build`, `lint`, at `preview` commands; dependencies ang React, Redux, MUI, Bootstrap, Firebase, Formik/Yup, Axios, at Recharts.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po nakalista ang frontend libraries at commands para sa development, lint, at production build.”*

### 📄 `frontend/package-lock.json`
- **📌 Ano ang laman nito:** Eksaktong resolved frontend dependency graph.
- **⚙️ Paano ito gumagana:** Nagbibigay ng repeatable install para sa parehong frontend package versions.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, lockfile po ito para consistent ang frontend dependencies sa bawat installation.”*

### 📄 `frontend/vite.config.js`
- **📌 Ano ang laman nito:** Vite configuration at React plugin setup.
- **⚙️ Paano ito gumagana:** Kinokontrol nito ang frontend development server at production build tooling.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, Vite configuration po ito na nagse-setup ng React development at build environment.”*

### 📄 `frontend/eslint.config.js`
- **📌 Ano ang laman nito:** ESLint flat configuration para sa JavaScript/JSX source.
- **⚙️ Paano ito gumagana:** Tinutukoy nito ang lint rules na pinapatakbo ng `npm --prefix frontend run lint`.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po nakatakda ang static code checks ng frontend.”*

### 📄 `frontend/index.html`
- **📌 Ano ang laman nito:** Browser document shell, metadata, at React root element.
- **⚙️ Paano ito gumagana:** Vite ang naghahain nito at ang `main.jsx` ang nagmo-mount ng React application sa root node.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang HTML entry shell kung saan mina-mount ng React ang buong frontend.”*

### 📄 `frontend/README.md`
- **📌 Ano ang laman nito:** Vite/React starter-template documentation.
- **⚙️ Paano ito gumagana:** Development reference ito mula sa scaffold; ang Pizzaro-specific setup at walkthrough ay nasa root `README.md` at `PROJECT_STRUCTURE.md`.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, scaffold reference lang po ito; ang project-specific documentation ay nasa root guides.”*

## `frontend/public/`

Static files ito na hinahain nang direkta ng Vite/browser nang hindi ini-import bilang JavaScript modules.

### 📄 `frontend/public/favicon.svg`
- **📌 Ano ang laman nito:** Browser tab favicon.
- **⚙️ Paano ito gumagana:** Ginagamit ito bilang maliit na brand icon sa browser tab.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang favicon ng Pizzaro browser tab.”*

### 📄 `frontend/public/icons.svg`
- **📌 Ano ang laman nito:** SVG icon asset/sprite.
- **⚙️ Paano ito gumagana:** Static visual resource ito na puwedeng i-reference ng interface.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, vector icon resource po ito para sa frontend.”*

## `frontend/public/images/`

Mga publicly served image assets ito para sa menu, branding, hero, at order confirmation.

### 📄 `frontend/public/images/Calzone.png`
- **📌 Ano ang laman nito:** Calzone menu/product image.
- **⚙️ Paano ito gumagana:** Ginagamit bilang static product visual kapag tinutukoy ng menu seed ang asset path.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang local image asset para sa Calzone menu item.”*

### 📄 `frontend/public/images/Caprese.png`
- **📌 Ano ang laman nito:** Caprese menu/product image.
- **⚙️ Paano ito gumagana:** Static image ito na ginagamit ng menu/product display.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang image asset ng Caprese pizza.”*

### 📄 `frontend/public/images/Capricciosa.png`
- **📌 Ano ang laman nito:** Capricciosa menu/product image.
- **⚙️ Paano ito gumagana:** Static image ito para sa menu/product presentation.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang image asset ng Capricciosa pizza.”*

### 📄 `frontend/public/images/Diavola.png`
- **📌 Ano ang laman nito:** Diavola menu/product image.
- **⚙️ Paano ito gumagana:** Ipinapakita ito bilang product visual kapag ginagamit ng seeded item.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang static product image ng Diavola.”*

### 📄 `frontend/public/images/Frutti di Mare.png`
- **📌 Ano ang laman nito:** Frutti di Mare menu/product image.
- **⚙️ Paano ito gumagana:** Ginagamit bilang local visual asset sa product catalog.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang image file para sa Frutti di Mare menu item.”*

### 📄 `frontend/public/images/Ortolona.png`
- **📌 Ano ang laman nito:** Ortolana product image asset; ang filename spelling ay `Ortolona.png`.
- **⚙️ Paano ito gumagana:** Tinutukoy ito ng menu seed bilang image ng Ortolana item.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang lokal na product image na nire-reference ng Ortolana seed record.”*

### 📄 `frontend/public/images/Pizza al Taglio.png`
- **📌 Ano ang laman nito:** Pizza al Taglio menu/product image.
- **⚙️ Paano ito gumagana:** Static asset ito para sa product card at details display.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang menu image para sa Pizza al Taglio.”*

### 📄 `frontend/public/images/Prosciutto e Rucola.png`
- **📌 Ano ang laman nito:** Prosciutto e Rucola menu/product image.
- **⚙️ Paano ito gumagana:** Ginagamit itong static product image sa storefront.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang image asset para sa Prosciutto e Rucola.”*

### 📄 `frontend/public/images/Quattro Formaggi.png`
- **📌 Ano ang laman nito:** Quattro Formaggi menu/product image.
- **⚙️ Paano ito gumagana:** Ipinapakita ito sa menu bilang produkto nitong pizza.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang local product image para sa Quattro Formaggi.”*

### 📄 `frontend/public/images/Tartufo Bianco.png`
- **📌 Ano ang laman nito:** Tartufo Bianco menu/product image.
- **⚙️ Paano ito gumagana:** Ginagamit ito ng menu seed at storefront bilang product visual.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang image asset para sa Tartufo Bianco pizza.”*

### 📄 `frontend/public/images/order_success.png`
- **📌 Ano ang laman nito:** Order confirmation illustration.
- **⚙️ Paano ito gumagana:** Ipinapakita ito sa post-checkout success page.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang confirmation graphic na lumalabas pagkatapos matanggap ang order.”*

### 📄 `frontend/public/images/pizzaro-hero.jpg`
- **📌 Ano ang laman nito:** Hero/featured pizza background or fallback image.
- **⚙️ Paano ito gumagana:** Ginagamit ng homepage hero o product image fallback kapag walang remote image.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang hero/fallback image para sa storefront presentation.”*

### 📄 `frontend/public/images/pizzaro-mark.svg`
- **📌 Ano ang laman nito:** Pizzaro brand mark vector.
- **⚙️ Paano ito gumagana:** Ginagamit sa header, footer, login/register branding, at admin navigation.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang reusable vector logo mark ng Pizzaro.”*

## `frontend/src/`

Dito nakalagay ang React entry point, global styling, application routes, features, state management, at shared utilities.

### 📄 `frontend/src/main.jsx`
- **📌 Ano ang laman nito:** React `createRoot`, Redux `Provider`, Axios credential setup, at import ng global CSS/App.
- **⚙️ Paano ito gumagana:** Mina-mount nito ang `App` sa HTML root at nagbibigay ng Redux store sa lahat ng components.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang React entry point kung saan ikinakabit ang global state at mina-mount ang application.”*

### 📄 `frontend/src/App.jsx`
- **📌 Ano ang laman nito:** Application routes, lazy-loaded screens, `ProtectedRoute` usage, shared header/footer, `ToastContainer`, user load, at hash scrolling.
- **⚙️ Paano ito gumagana:** Tinutukoy nito kung aling component ang ipapakita sa bawat URL at kung kailangan ng customer/admin authentication. Gumagamit ito ng lazy loading para sa route components.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang route at application shell; dito nakakabit ang public pages, protected customer pages, admin pages, at notifications.”*

### 📄 `frontend/src/App.css`
- **📌 Ano ang laman nito:** Custom styling para sa storefront, admin dashboard, forms, cards, navigation, responsive states, at visual design.
- **⚙️ Paano ito gumagana:** Ina-apply ang app-specific styles sa class names na ginagamit ng React components.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang pangunahing custom CSS para sa Pizzaro branding at responsive interface.”*

### 📄 `frontend/src/index.css`
- **📌 Ano ang laman nito:** Global/base CSS at browser-wide typography defaults.
- **⚙️ Paano ito gumagana:** Ini-import ito sa `main.jsx` para maging baseline style ng buong app.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang global stylesheet na nagtatakda ng base styles ng buong frontend.”*

### 📄 `frontend/src/store.js`
- **📌 Ano ang laman nito:** Redux `createStore`, `combineReducers`, Redux Thunk middleware, at initial cart/auth state.
- **⚙️ Paano ito gumagana:** Pinagsasama nito ang product, user, cart, at order reducers at ine-export ang iisang store na ibinibigay ng React Redux Provider.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang central Redux store na nag-uugnay sa reducers at async middleware para shared ang application state.”*

## `frontend/src/Components/`

Ang Components tree ang may user-facing screens at reusable interface elements, nakaayos ayon sa business feature.

### `frontend/src/Components/` root

#### 📄 `frontend/src/Components/Home.jsx`
- **📌 Ano ang laman nito:** Homepage hero, product catalog, filter state, search keyword/page handling, pagination, at featured-product cart action.
- **⚙️ Paano ito gumagana:** Kumukuha ito ng products sa Redux action ayon sa query/filter state at ipinapakita ang cards, filters, empty/error/loading states, at page controls.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang storefront homepage—hero section, menu catalog, advanced filters, pagination, at add-to-cart flow.”*

### `frontend/src/Components/Admin/`

Admin dashboard, management tables, forms, analytics, at moderation screens ang laman nito.

#### 📄 `frontend/src/Components/Admin/AdminPageLayout.jsx`
- **📌 Ano ang laman nito:** Reusable `AdminPageLayout` component na tumatanggap ng title, description, actions, at children.
- **⚙️ Paano ito gumagana:** Pinag-iisa nito ang admin sidebar, page heading, metadata, at content shell ng admin pages.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable layout po ito para pare-pareho ang structure ng admin management pages.”*

#### 📄 `frontend/src/Components/Admin/Dashboard.jsx`
- **📌 Ano ang laman nito:** Dashboard summary metrics, customer/order/product loading, search state, alerts, notifications menu, at chart/widget composition.
- **⚙️ Paano ito gumagana:** Pinagsasama nito ang data mula sa orders, products, at customers upang ipakita ang overview metrics at store activity.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang admin overview dashboard na pinagsasama ang sales, orders, customers, stock alerts, at trending products.”*

#### 📄 `frontend/src/Components/Admin/DashboardWidgets.jsx`
- **📌 Ano ang laman nito:** `MetricCard`, `RevenueWaveChart`, `TrendingItemsList`, at `SalesBarChart`.
- **⚙️ Paano ito gumagana:** Reusable Recharts/MUI widgets ang nagko-compute at nagpapakita ng recent paid revenue, completed-order product ranking, sales bars, at metric cards.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang reusable dashboard metrics at charts na ginagamit ng admin overview.”*

#### 📄 `frontend/src/Components/Admin/MonthlySalesChart.jsx`
- **📌 Ano ang laman nito:** `MonthlySalesChart` component, preset/custom date-range state, sales fetch, zero-filled daily series, tooltip, at Recharts line chart.
- **⚙️ Paano ito gumagana:** Kinukuha nito ang admin daily-sales API ayon sa date range at nirere-render ang daily revenue chart.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang interactive sales-over-time chart; nagbabago ang data kapag pinalitan ang date range.”*

#### 📄 `frontend/src/Components/Admin/NewProduct.jsx`
- **📌 Ano ang laman nito:** Formik product creation form, Yup schema, image previews, multiple file selection, at Redux submit.
- **⚙️ Paano ito gumagana:** Bumubuo ito ng `FormData` para sa product fields at images at ipinapadala sa admin create endpoint.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po gumagawa ng bagong product ang admin, kasama ang client-side validation at multiple image upload.”*

#### 📄 `frontend/src/Components/Admin/OrdersList.jsx`
- **📌 Ano ang laman nito:** Admin orders Data Grid, order summary columns, view/delete actions, loading/error handling.
- **⚙️ Paano ito gumagana:** Kinukuha nito ang lahat ng orders sa Redux action at nagbibigay ng links sa order processing screen.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang admin order table para makita, buksan, at i-manage ang customer orders.”*

#### 📄 `frontend/src/Components/Admin/ProcessOrder.jsx`
- **📌 Ano ang laman nito:** Admin order detail layout, customer/delivery summary, itemized total, status selector, at update action.
- **⚙️ Paano ito gumagana:** Ipinapakita nito ang order details at nagsusumite ng status update sa backend. Walang payment-method o payment-confirmation control.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po tinitingnan ng admin ang delivery at order items, ina-update ang status, at nagpapadala ng email na may PDF receipt.”*

#### 📄 `frontend/src/Components/Admin/ProductReviews.jsx`
- **📌 Ano ang laman nito:** Product-ID review search, moderation Data Grid, review deletion confirmation, loading/error/empty states.
- **⚙️ Paano ito gumagana:** Kinukuha ang reviews para sa napiling product at tinatawag ang admin-protected delete endpoint pagkatapos ng confirmation.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang admin moderation screen para hanapin at burahin ang reviews para sa isang product.”*

#### 📄 `frontend/src/Components/Admin/ProductSalesChart.jsx`
- **📌 Ano ang laman nito:** Product-sales API fetch at Recharts pie chart.
- **⚙️ Paano ito gumagana:** Ipinapakita ang product revenue share mula sa admin analytics endpoint at may loading/error/empty states.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ipinapakita po ng pie chart na ito ang bahagi ng sales na naiaambag ng bawat product.”*

#### 📄 `frontend/src/Components/Admin/ProductsList.jsx`
- **📌 Ano ang laman nito:** Admin product Data Grid, row edit/delete, checkbox selection model, bulk-delete confirmation, success/error notifications.
- **⚙️ Paano ito gumagana:** Kinukuha nito ang admin products at nagpapadala ng single o batch delete actions. Ang bulk operation ay validated muli sa backend.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang product management table, kabilang ang row actions at checkbox-based bulk delete.”*

#### 📄 `frontend/src/Components/Admin/SideBar.jsx`
- **📌 Ano ang laman nito:** Admin navigation links, user avatar/initials, logout handler, at menu metadata.
- **⚙️ Paano ito gumagana:** Nagbibigay ito ng shared navigation sa dashboard, orders, products, users, analytics, at reviews.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang reusable admin sidebar para mabilis mag-navigate sa management modules.”*

#### 📄 `frontend/src/Components/Admin/UpdateProduct.jsx`
- **📌 Ano ang laman nito:** Product edit form, Formik/Yup validation, retained/removed image tracking, new image previews, update action.
- **⚙️ Paano ito gumagana:** Kinukuha ang kasalukuyang product at ipinapadala ang changed fields, retained image IDs, at bagong images sa backend.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ina-update ng admin ang product fields at pinipili kung aling photos ang pananatilihin o papalitan.”*

#### 📄 `frontend/src/Components/Admin/UpdateUser.jsx`
- **📌 Ano ang laman nito:** User lookup at `UpdateUserForm` para sa name, email, at role changes.
- **⚙️ Paano ito gumagana:** Kinukuha ang user details at ipinapadala ang updated fields sa admin user endpoint.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po minamanage ng admin ang customer profile at role assignment.”*

#### 📄 `frontend/src/Components/Admin/UserSalesChart.jsx`
- **📌 Ano ang laman nito:** Customer-sales API fetch at Recharts bar chart.
- **⚙️ Paano ito gumagana:** Ipinapakita ang completed sales totals kada customer, may loading, empty, at error display.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ipinapakita po ng chart na ito ang completed sales na naka-group ayon sa customer.”*

#### 📄 `frontend/src/Components/Admin/UsersList.jsx`
- **📌 Ano ang laman nito:** Admin users Data Grid, edit/delete row actions, loading/error handling at notifications.
- **⚙️ Paano ito gumagana:** Kinukuha nito ang user list sa Redux actions at nagbibigay ng navigation sa update screen o delete operation.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang admin user table para makita at ma-manage ang registered accounts.”*

### `frontend/src/Components/Cart/`

Checkout components para sa cart, shipping details, order review, order submission, progress, at success.

#### 📄 `frontend/src/Components/Cart/Cart.jsx`
- **📌 Ano ang laman nito:** Cart item list, quantity controls, remove action, subtotal estimate, empty-cart state, checkout navigation.
- **⚙️ Paano ito gumagana:** Binabasa ang Redux cart, tinitingnan ang available stock kapag tinaasan ang quantity, at dinadala ang user sa authenticated checkout.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po nirerepaso at binabago ng customer ang cart bago mag-checkout.”*

#### 📄 `frontend/src/Components/Cart/Shipping.jsx`
- **📌 Ano ang laman nito:** Shipping address/contact form at country selector.
- **⚙️ Paano ito gumagana:** Sine-save ang shipping info sa Redux/local storage at dinadala ang customer sa order confirmation step.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, kinokolekta po rito ang delivery information at sine-save muna bago kumpirmahin ang order.”*

#### 📄 `frontend/src/Components/Cart/ConfirmOrder.jsx`
- **📌 Ano ang laman nito:** Shipping summary, cart line items, subtotal/tax/shipping/total calculation, continuation action.
- **⚙️ Paano ito gumagana:** Ipinapakita ang estimated order summary at inililipat ang user sa place-order screen. Server pa rin ang authoritative sa totals.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po sinusuri ng customer ang items at estimated total; muling kinukuwenta ng server ang final total.”*

#### 📄 `frontend/src/Components/Cart/Payment.jsx`
- **📌 Ano ang laman nito:** Final place-order form, order submit handler, cart clear, at success navigation.
- **⚙️ Paano ito gumagana:** Gumagawa ito ng order request at ipinapakita ang Pending-order flow. Walang payment-method fields dahil hindi ito requirement sa rubric.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po kinukumpirma ng customer ang order; pagkatapos, ise-save ito bilang Pending at makikita ang progress sa account.”*

#### 📄 `frontend/src/Components/Cart/OrderSuccess.jsx`
- **📌 Ano ang laman nito:** Confirmation illustration, pending-order message, at link sa customer orders.
- **⚙️ Paano ito gumagana:** Ipinapakita pagkatapos matagumpay na matanggap ng API ang bagong order.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang confirmation screen na nagsasabing natanggap na ang order at naghihintay ng confirmation.”*

#### 📄 `frontend/src/Components/Cart/CheckoutSteps.jsx`
- **📌 Ano ang laman nito:** `CheckoutSteps` progress component para sa shipping, confirm order, at place order.
- **⚙️ Paano ito gumagana:** Ipinapakita kung aling checkout step ang active o hindi pa kumpleto.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, visual progress indicator po ito para makita ng customer kung nasaan na siya sa checkout.”*

### `frontend/src/Components/Layout/`

Shared site chrome at metadata components.

#### 📄 `frontend/src/Components/Layout/Header.jsx`
- **📌 Ano ang laman nito:** Store navigation, responsive menu, search, user/account menu, logout, at cart item count.
- **⚙️ Paano ito gumagana:** Binabasa nito ang authenticated user at cart mula Redux at nagpapakita ng angkop na navigation/actions.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang shared header para sa navigation, account actions, search, at cart access.”*

#### 📄 `frontend/src/Components/Layout/Footer.jsx`
- **📌 Ano ang laman nito:** Brand footer at navigation links.
- **⚙️ Paano ito gumagana:** Ipinapakita sa ilalim ng pages ang Pizzaro branding at links sa menu/about/cart.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang reusable footer at secondary navigation ng storefront.”*

#### 📄 `frontend/src/Components/Layout/Search.jsx`
- **📌 Ano ang laman nito:** Search input state at submit handler.
- **⚙️ Paano ito gumagana:** Dinadala ang non-empty keyword sa `/search/:keyword`; kung blank, bumabalik sa homepage.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po kinukuha ang search keyword at ipinapasa ito sa catalog route.”*

#### 📄 `frontend/src/Components/Layout/Loader.jsx`
- **📌 Ano ang laman nito:** Minimal reusable loading indicator.
- **⚙️ Paano ito gumagana:** Ipinapakita habang hinihintay ang asynchronous data o protected-route authentication.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, shared loading component po ito para may feedback habang kumukuha ng data.”*

#### 📄 `frontend/src/Components/Layout/MetaData.jsx`
- **📌 Ano ang laman nito:** `MetaData` component gamit ang React Helmet para sa document title.
- **⚙️ Paano ito gumagana:** Ina-update nito ang browser tab title ayon sa kasalukuyang screen.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable metadata component po ito para tama ang page title sa bawat route.”*

### `frontend/src/Components/Order/`

Customer order history at order details screens ang laman nito.

#### 📄 `frontend/src/Components/Order/ListOrders.jsx`
- **📌 Ano ang laman nito:** Customer order-history Data Grid na may order ID, item count, total, status, at detail link.
- **⚙️ Paano ito gumagana:** Kinukuha ang sariling orders ng authenticated user gamit ang Redux order action.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po makikita ng customer ang sarili niyang order history at status.”*

#### 📄 `frontend/src/Components/Order/OrderDetails.jsx`
- **📌 Ano ang laman nito:** Single-order shipping details, order status, line items, totals, and loading/error states.
- **⚙️ Paano ito gumagana:** Kinukuha ang order ayon sa route ID; pinapahintulutan ng backend ang may-ari ng order o admin.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang detalye ng isang order; kino-control ng backend kung customer owner o admin lang ang makakakita.”*

### `frontend/src/Components/Product/`

Storefront product card at product detail/review screen.

#### 📄 `frontend/src/Components/Product/Product.jsx`
- **📌 Ano ang laman nito:** Product card, image, price, average rating/review count, stock badge, details link, add-to-cart action.
- **⚙️ Paano ito gumagana:** Nagpapakita ng catalog item at kumukuha ng fresh product data bago idagdag sa cart.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable product card po ito na nagpapakita ng presyo, rating, stock, at add-to-cart action.”*

#### 📄 `frontend/src/Components/Product/ProductDetails.jsx`
- **📌 Ano ang laman nito:** Product detail view, image gallery, stock/price display, cart controls, review fetch/edit/submit UI.
- **⚙️ Paano ito gumagana:** Kinukuha nito ang product at reviews, at ipinapakita ang review action ayon sa login at purchase eligibility response ng backend.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po makikita ang product details at reviews; server ang nagdedesisyon kung eligible ang customer na mag-review.”*

### `frontend/src/Components/Review/`

Review presentation components.

#### 📄 `frontend/src/Components/Review/ListReviews.jsx`
- **📌 Ano ang laman nito:** Review list renderer, star visualization, author/comment display, at optional own-review edit button.
- **⚙️ Paano ito gumagana:** Tumatanggap ito ng reviews at current user ID bilang props at ipinapakita lamang ang edit control sa matching author.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable review list po ito; sariling review lang ng kasalukuyang user ang may edit button.”*

### `frontend/src/Components/Route/`

Route-level access guards.

#### 📄 `frontend/src/Components/Route/ProtectedRoute.jsx`
- **📌 Ano ang laman nito:** `ProtectedRoute` component na tumatanggap ng children at optional `isAdmin`.
- **⚙️ Paano ito gumagana:** Nagpapakita muna ng loader habang nilo-load ang session; hindi authenticated ay nire-redirect sa login at non-admin ay inilalayo sa admin page.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang frontend route guard para hindi mabuksan ang customer/admin pages nang walang tamang session at role.”*

### `frontend/src/Components/User/`

Login, registration, account profile, password, at social authentication screens.

#### 📄 `frontend/src/Components/User/Login.jsx`
- **📌 Ano ang laman nito:** Formik/Yup login form, remember-email option, password visibility toggle, redirect handling, social login buttons.
- **⚙️ Paano ito gumagana:** Nagpapadala ng email/password sa auth action, nagpapakita ng errors, at nireredirect ang authenticated user sa hiniling na page o dashboard.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang customer/admin login kasama ang validation, redirect, at Google/Facebook sign-in.”*

#### 📄 `frontend/src/Components/User/Register.jsx`
- **📌 Ano ang laman nito:** Registration form state, avatar preview, password visibility, submit action, at SocialLoginButtons.
- **⚙️ Paano ito gumagana:** Ipinapadala ang account fields at optional avatar sa registration endpoint, pagkatapos ay hinahawakan ang success/error state.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po gumagawa ng account ang user at maaari ring magdagdag ng profile photo.”*

#### 📄 `frontend/src/Components/User/SocialLoginButtons.jsx`
- **📌 Ano ang laman nito:** Google/Facebook provider definitions, Firebase popup sign-in, ID token retrieval, social-login action, error UI.
- **⚙️ Paano ito gumagana:** Kumukuha ito ng Firebase ID token sa matagumpay na provider login at ipinapadala sa backend para sa verification at app session.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, Firebase popup login po ito; pagkatapos mag-authenticate, vine-verify ng backend ang token bago mag-login sa Pizzaro.”*

#### 📄 `frontend/src/Components/User/Profile.jsx`
- **📌 Ano ang laman nito:** User profile display, avatar, account details, edit-profile, orders, at password links.
- **⚙️ Paano ito gumagana:** Binabasa nito ang authenticated user state mula Redux at nire-redirect sa login kapag walang user.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po makikita ng user ang sariling profile at links para baguhin ang account o tingnan ang orders.”*

#### 📄 `frontend/src/Components/User/UpdateProfile.jsx`
- **📌 Ano ang laman nito:** Formik/Yup profile update fields, avatar file validation/preview, submit and success/error handling.
- **⚙️ Paano ito gumagana:** Ipinapadala ang validated profile fields at optional image sa protected profile endpoint.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ina-update ang profile information; chine-check ang fields at avatar bago ipadala sa server.”*

#### 📄 `frontend/src/Components/User/UpdatePassword.jsx`
- **📌 Ano ang laman nito:** Old/new password form, Redux update action, loading/error/success states.
- **⚙️ Paano ito gumagana:** Ipinapadala sa protected password endpoint ang kasalukuyan at bagong password at bumabalik sa profile kapag successful.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po pinapalitan ng authenticated user ang password matapos i-verify ang lumang password sa server.”*

#### 📄 `frontend/src/Components/User/ForgotPassword.jsx`
- **📌 Ano ang laman nito:** Email input at forgot-password Redux action.
- **⚙️ Paano ito gumagana:** Humihiling ito sa backend na magpadala ng password-reset link sa email at ipinapakita ang feedback.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po sinisimulan ang password recovery sa pamamagitan ng registered email.”*

#### 📄 `frontend/src/Components/User/NewPassword.jsx`
- **📌 Ano ang laman nito:** Reset token route handling, new/confirm password state, API request, success/error toast.
- **⚙️ Paano ito gumagana:** Ipinapadala ang reset token at bagong password sa backend, kung saan bine-verify ang token at expiry.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po tinatapos ang password reset gamit ang time-limited link na ipinadala sa email.”*

### `frontend/src/Components/Utils/`

Legacy/shared utility helpers na ginagamit ng ilang bahagi ng app.

#### 📄 `frontend/src/Components/Utils/helpers.jsx`
- **📌 Ano ang laman nito:** Legacy session-storage helpers para sa user/token, authenticate/logout callbacks, at toast helpers.
- **⚙️ Paano ito gumagana:** Nagbibigay ito ng helper functions sa lumang auth flow; ang kasalukuyang core session ay pinangangasiwaan ng Redux actions at HTTP-only cookie.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, legacy helper module po ito; ang pangunahing kasalukuyang auth flow ay gumagamit ng Redux at secure cookie session.”*

## `frontend/src/actions/`

Redux Thunk action creators ang tumatawag sa backend at nagdi-dispatch ng request/success/failure action types.

### 📄 `frontend/src/actions/cartActions.js`
- **📌 Ano ang laman nito:** Add/remove/restore cart, per-user cart persistence, shipping info save, cart clear, stock/quantity validation.
- **⚙️ Paano ito gumagana:** Kumukuha muna ng product sa API bago idagdag sa cart at nagse-save ng cart data sa local storage.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang cart actions, kasama ang stock check at local persistence para hindi mawala agad ang cart.”*

### 📄 `frontend/src/actions/orderActions.js`
- **📌 Ano ang laman nito:** Create order, fetch own/all orders, fetch order detail, update/delete order, clear errors.
- **⚙️ Paano ito gumagana:** Gumagawa ang thunks ng Axios requests at nagdi-dispatch ng order lifecycle action types sa Redux reducers.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang frontend API calls para gumawa, kumuha, at mag-update ng orders.”*

### 📄 `frontend/src/actions/productActions.jsx`
- **📌 Ano ang laman nito:** Product list/details, admin product list, create/update/delete/bulk-delete, reviews, at error-clear actions.
- **⚙️ Paano ito gumagana:** Binubuo nito ang catalog query params at tumatawag sa product/review API, saka ipinapasa ang resulta sa reducers.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang product at review API actions na nag-uugnay sa React components at backend.”*

### 📄 `frontend/src/actions/userActions.jsx`
- **📌 Ano ang laman nito:** Register/login/logout/load user, social login, profile/password update, forgot/reset password, admin users operations.
- **⚙️ Paano ito gumagana:** Gumagawa ng Axios requests na may credentials kung kailangan at nagdi-dispatch ng auth/user reducer actions.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po nakapangkat ang user authentication, account update, password recovery, at admin user actions.”*

## `frontend/src/constants/`

Action type strings at reusable category data ang laman nito.

### 📄 `frontend/src/constants/cartConstants.js`
- **📌 Ano ang laman nito:** Cart action type constants.
- **⚙️ Paano ito gumagana:** Ginagamit ng cart actions at reducer para magkasundo sa event names gaya ng add, remove, save, clear, at restore.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, central list po ito ng cart action names para maiwasan ang typo sa dispatch at reducer.”*

### 📄 `frontend/src/constants/orderConstants.js`
- **📌 Ano ang laman nito:** Order request/success/failure/reset action constants.
- **⚙️ Paano ito gumagana:** Ikinokonekta ang order thunks sa kaukulang order reducer branches.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang event names para sa Redux order lifecycle.”*

### 📄 `frontend/src/constants/productConstants.jsx`
- **📌 Ano ang laman nito:** Product listing/details/create/update/delete/review action constants.
- **⚙️ Paano ito gumagana:** Ginagamit sa product actions at reducers upang tukuyin ang request states at result/error states.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-centralize ang Redux action types para sa products at reviews.”*

### 📄 `frontend/src/constants/userConstants.jsx`
- **📌 Ano ang laman nito:** Auth, user, profile, password, admin user action constants.
- **⚙️ Paano ito gumagana:** Pinag-iisa nito ang action labels na ginagamit ng user/auth thunks at reducers.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, ito po ang shared action type definitions para sa account at authentication state.”*

### 📄 `frontend/src/constants/productCategories.js`
- **📌 Ano ang laman nito:** Frontend product category list.
- **⚙️ Paano ito gumagana:** Pinupuno nito ang category dropdown sa product create/update forms.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable category data po ito para pare-pareho ang pagpipilian sa product forms.”*

## `frontend/src/reducers/`

Pure Redux reducers ang nagbabago ng application state ayon sa dispatched action.

### 📄 `frontend/src/reducers/cartReducers.js`
- **📌 Ano ang laman nito:** `cartReducer` para sa cart items, shipping info, clear, at restore actions.
- **⚙️ Paano ito gumagana:** Gumagawa ito ng bagong state object sa bawat action at hindi direktang binabago ang dating state.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ina-update ng Redux ang cart at shipping state batay sa cart actions.”*

### 📄 `frontend/src/reducers/orderReducers.js`
- **📌 Ano ang laman nito:** Reducers para sa create order, my orders, details, all orders, update/delete states.
- **⚙️ Paano ito gumagana:** Nagtatala ito ng loading, result, error, at reset state para sa bawat order request.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po pinoproseso ng Redux ang order loading, results, errors, at admin updates.”*

### 📄 `frontend/src/reducers/productReducers.jsx`
- **📌 Ano ang laman nito:** Product list, product details, new product, update/delete, at review reducers.
- **⚙️ Paano ito gumagana:** Iniimbak nito ang catalog data, counts, categories, loading states, at errors na natatanggap sa product actions.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ina-update ang product-related global state pagkatapos ng API responses.”*

### 📄 `frontend/src/reducers/userReducers.jsx`
- **📌 Ano ang laman nito:** Auth/session, user profile, password recovery, users list, at user details reducers.
- **⚙️ Paano ito gumagana:** Pinamamahalaan nito ang authenticated user, loading/error state, at admin account-management responses.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ang Redux state para sa login session, profile, at user administration.”*

## `frontend/src/utils/`

Shared configuration, formatting, local preview, revenue, at validation utilities.

### 📄 `frontend/src/utils/firebase.js`
- **📌 Ano ang laman nito:** Firebase client configuration, Firebase Auth getter, Google/Facebook provider factory.
- **⚙️ Paano ito gumagana:** Nagbabasa ng public `VITE_FIREBASE_*` configuration at gumagawa ng provider para sa popup login.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po naka-configure ang Firebase browser client at social login providers.”*

### 📄 `frontend/src/utils/formatCurrency.js`
- **📌 Ano ang laman nito:** `formatCurrency()` helper at PHP currency formatter.
- **⚙️ Paano ito gumagana:** Pare-pareho nitong ipinapakita ang numeric amounts sa Philippine peso format sa UI.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, shared formatter po ito para consistent ang currency display sa buong app.”*

### 📄 `frontend/src/utils/orderRevenue.js`
- **📌 Ano ang laman nito:** Revenue status set, `revenueDate()` at `isRevenueOrder()` helpers.
- **⚙️ Paano ito gumagana:** Tinutukoy nito ang completed/fulfilled orders para sa analytics at ginagamit ang completion date o legacy order creation date para sa chart.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, shared helpers po ito para pare-pareho ang completed-order sales at date calculation sa dashboard.”*

### 📄 `frontend/src/utils/readImagePreviews.js`
- **📌 Ano ang laman nito:** `readImagePreviews(files)` Promise helper.
- **⚙️ Paano ito gumagana:** Gumagamit ng `FileReader` para gumawa ng local preview data URL para sa bawat napiling larawan.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, dito po ginagawa ang local image previews bago i-upload ang mga larawan.”*

### 📄 `frontend/src/utils/validationSchemas.js`
- **📌 Ano ang laman nito:** Yup schemas para sa product create/update, login, profile update, at image validation.
- **⚙️ Paano ito gumagana:** Ginagamit ng Formik forms para i-check ang field formats, required values, length, numeric ranges, at image constraints bago mag-submit.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, reusable Yup schemas po ito para pare-pareho ang frontend validation ng product, login, at profile forms.”*

## `frontend/src/assets/`

Bundled visual assets ito na ini-import ng frontend source code.

### 📄 `frontend/src/assets/hero.png`
- **📌 Ano ang laman nito:** Bundled hero image asset.
- **⚙️ Paano ito gumagana:** Available ito sa Vite module pipeline kung ini-import ng component/style.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, bundled visual asset po ito na puwedeng gamitin ng frontend.”*

### 📄 `frontend/src/assets/react.svg`
- **📌 Ano ang laman nito:** React logo scaffold asset.
- **⚙️ Paano ito gumagana:** Static SVG asset mula sa React/Vite starter; hindi ito business logic.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, starter asset po ito at hindi bahagi ng order o catalog logic.”*

### 📄 `frontend/src/assets/vite.svg`
- **📌 Ano ang laman nito:** Vite logo scaffold asset.
- **⚙️ Paano ito gumagana:** Static SVG mula sa starter template.
- **🗣️ Paano ipaliwanag kay Sir:** *“Sir, development scaffold image po ito at hindi runtime feature ng storefront.”*

---

## ⚙️ Useful commands para sa demo

```sh
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend start
npm --prefix frontend run dev
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

**Tandaan:** React/Express/MongoDB ang system. Walang payment-method o payment-processing feature dahil wala ito sa functional requirements rubric. Kailangang naka-configure ang MongoDB, Cloudinary, SMTP, at Firebase para ma-demo ang kani-kanilang external integration. Huwag ipakita sa projector o i-commit ang `.env` values.
