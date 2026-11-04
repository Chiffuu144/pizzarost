# Pizzaro: Functional Requirements Code Walkthrough

Gagamitin ang gabay na ito para ipakita at ipaliwanag ang Pizzaro project batay sa 220-point rubric. Kapag tinanong kung nasaan ang isang requirement, buksan ang naka-link na file at gamitin ang maikling demo script.

> Ang mga path at line anchor sa ibaba ay tumutukoy sa kasalukuyang codebase. Maaaring magbago ang line number kapag nag-edit ng code. Huwag mag-claim ng behavior na wala sa implementation.

## Project overview

Ang Pizzaro ay isang pizza storefront na may React frontend at Express/MongoDB backend. Kasama rito ang product catalog, cart at checkout, reviews, admin tools, sales dashboard, at Firebase social login.

### Paano patakbuhin

Kailangan ang Node.js/npm at sariling development configuration para sa MongoDB, Cloudinary, SMTP, at Firebase.

1. Gumawa ng local `backend/config/.env` at `frontend/.env` gamit ang environment variable names na ginagamit sa code. Huwag magdagdag ng tunay na secrets sa Git, README, o chat.
2. Sa root ng repository:

   ```sh
   npm install
   ```

3. I-install at patakbuhin ang backend:

   ```sh
   npm --prefix backend install
   npm --prefix backend start
   ```

4. Sa hiwalay na terminal, patakbuhin ang frontend:

   ```sh
   npm --prefix frontend install
   npm --prefix frontend run dev
   ```

5. Patakbuhin ang checks:

   ```sh
   npm --prefix backend test
   npm --prefix frontend run lint
   npm --prefix frontend run build
   ```

Naglo-load ang [backend/server.js](./backend/server.js), kumokonekta sa MongoDB gamit ang [backend/config/database.js](./backend/config/database.js), at nagse-seed ng menu bago mag-start. Kailangan ng wastong `.env` values para gumana ang database, larawan, email, at OAuth integrations.

## 1. MP1: Core Management — 20 points

### Product CRUD at data tables — 5 points

- **📍 Lokasyon:** [Products admin table](./frontend/src/Components/Admin/ProductsList.jsx#L145), [Create form](./frontend/src/Components/Admin/NewProduct.jsx#L21), [Update form](./frontend/src/Components/Admin/UpdateProduct.jsx#L46), [Product API routes](./backend/routes/product.js#L24), [Product controllers](./backend/controllers/product.js#L67).
- **⚙️ Paano gumagana:** Ipinapakita ng MUI Data Grid ang mga produkto at row actions para mag-edit o mag-delete. Ang create, update, at delete requests ay pinoproseso ng admin-protected backend routes.
- **🗣️ Demo script:** *“Sir, dito po sa Products page nakikita ang product table. Mula rito, puwedeng gumawa, mag-edit, at mag-delete ng produkto; admin-only ang mga pagbabago sa backend.”*

### Multiple photo uploads — 5 points

- **📍 Lokasyon:** [Create image input](./frontend/src/Components/Admin/NewProduct.jsx#L136), [Update image input](./frontend/src/Components/Admin/UpdateProduct.jsx#L162), [Multer upload routes](./backend/routes/product.js#L24), [Image validation at Cloudinary upload](./backend/utils/productImages.js#L4).
- **⚙️ Paano gumagana:** Tumatanggap ang product forms ng maraming image file. Nililimitahan at vine-validate ng backend ang image format, file size, at bilang bago i-upload ang mga ito sa Cloudinary.
- **🗣️ Demo script:** *“Sir, puwede pong pumili ng maraming larawan para sa isang product. Vine-validate muna ang files bago i-upload sa Cloudinary at i-save ang image references.”*

### Bulk delete gamit ang checkboxes — 10 points

- **📍 Lokasyon:** [Selection state at delete action](./frontend/src/Components/Admin/ProductsList.jsx#L25), [Checkbox Data Grid](./frontend/src/Components/Admin/ProductsList.jsx#L234), [Bulk-delete route](./backend/routes/product.js#L25), [Bulk-delete handler](./backend/controllers/product.js#L231).
- **⚙️ Paano gumagana:** Iniipon ng Data Grid selection model ang IDs ng napiling rows. Pagkatapos ng confirmation, ipinapadala ang IDs sa admin-only endpoint; vine-validate ng backend ang IDs at nililimitahan ang batch bago burahin ang products at linisin ang associated images.
- **🗣️ Demo script:** *“Sir, puwedeng pumili ng maraming product rows gamit ang checkboxes at burahin sa isang action. May confirmation at server-side validation bago isagawa ang bulk delete.”*

## 2. MP2: Advanced Filtering — 20 points

### Price filter — 5 points

- **📍 Lokasyon:** [Price inputs](./frontend/src/Components/Home.jsx#L240), [Product query parameters](./frontend/src/actions/productActions.jsx#L28), [MongoDB price filter](./backend/utils/apiFeatures.js#L21).
- **⚙️ Paano gumagana:** Ipinapadala ng homepage ang minimum at maximum price bilang query parameters. Ginagamit ng backend ang `$gte` at `$lte` para isama lamang ang pasok sa range.
- **🗣️ Demo script:** *“Sir, naglalagay po tayo ng minimum at maximum na presyo. Ipinapasa ang range sa API at gumagamit ang database query ng `$gte` at `$lte`.”*

### Category filter — 5 points

- **📍 Lokasyon:** [Homepage category filter](./frontend/src/Components/Home.jsx#L220), [Category query parameter](./frontend/src/actions/productActions.jsx#L48), [Category query logic](./backend/utils/apiFeatures.js#L27).
- **⚙️ Paano gumagana:** Ipinapadala ang napiling category kasama ng product request. Sinusuportahan ng backend ang isang category o listahan ng categories.
- **🗣️ Demo script:** *“Sir, kapag pumili po ng category sa homepage, ipinapadala iyon sa API para category-matched lang na products ang bumalik.”*

### Ratings filter — 5 points

- **📍 Lokasyon:** [Minimum rating control](./frontend/src/Components/Home.jsx#L268), [Rating parameter](./frontend/src/actions/productActions.jsx#L48), [Rating query](./backend/utils/apiFeatures.js#L39).
- **⚙️ Paano gumagana:** Nagpapadala ang UI ng minimum rating at ginagamit ng backend ang `$gte` laban sa product average rating. Ang average ay kinukuwenta mula sa reviews sa [review controller](./backend/controllers/product.js#L299).
- **🗣️ Demo script:** *“Sir, minimum rating po ang pinipili sa filter. Kinukumpara ito ng backend sa average star rating ng product gamit ang `$gte`.”*

### Review count/presence filter — 5 points

- **📍 Lokasyon:** [Has reviews control](./frontend/src/Components/Home.jsx#L284), [Review filter parameter](./frontend/src/actions/productActions.jsx#L49), [Review presence query](./backend/utils/apiFeatures.js#L42).
- **⚙️ Paano gumagana:** May `Has reviews` checkbox na nagfi-filter kung may kahit isang review (`numOfReviews > 0`), at may hiwalay ding review-text search. Hindi ito slider o filter para sa eksaktong minimum review count.
- **🗣️ Demo script:** *“Sir, puwede pong ipakita lang ang products na may reviews. Presence-based po ang filter na ito; hindi nito pinipili ang eksaktong bilang ng reviews.”*

## 3. MP3: Review & Rating System — 20 points

### Customer authorization sa pag-review — 10 points

- **📍 Lokasyon:** [Review submission at purchase check](./backend/controllers/product.js#L259), [Review eligibility query](./backend/utils/orderLifecycle.js#L10), [Authenticated review route](./backend/routes/product.js#L31).
- **⚙️ Paano gumagana:** Bago gumawa ng bagong review, tinitingnan ng backend kung ang naka-login na user ay may order na naglalaman ng product, may completed/delivered status, at may kumpirmadong bayad.
- **🗣️ Demo script:** *“Sir, bago gumawa ng bagong review, chine-check muna ng server kung ang customer ay bumili ng product at completed o delivered na ang bayad na order.”*

### Pag-update ng sariling review — 5 points

- **📍 Lokasyon:** [Review owner lookup at update](./backend/controllers/product.js#L276), [Review submission UI](./frontend/src/Components/Product/ProductDetails.jsx).
- **⚙️ Paano gumagana:** Hinahanap ng backend ang review na tumutugma sa kasalukuyang authenticated user. Kapag mayroon na, ang rating at comment ng review na iyon ang ina-update sa halip na magdagdag ng duplicate.
- **🗣️ Demo script:** *“Sir, hinahanap po ng backend ang review gamit ang kasalukuyang user ID. Sariling review lang ng naka-login na customer ang ina-update niya.”*

### Admin moderation — 5 points

- **📍 Lokasyon:** [Admin reviews table](./frontend/src/Components/Admin/ProductReviews.jsx#L48), [Admin-only delete route](./backend/routes/product.js#L33), [Delete review handler](./backend/controllers/product.js#L334).
- **⚙️ Paano gumagana:** Nakakahanap ang admin ng reviews ayon sa product ID at nakakabura ng review sa moderation table. Protektado ng role authorization ang delete endpoint.
- **🗣️ Demo script:** *“Sir, sa Product Reviews admin page puwedeng hanapin at burahin ang inappropriate review. Admin-only ang backend route kaya hindi ito basta matawag ng customer.”*

## 4. Term Test LAB: E-Commerce & Transaction Lifecycle — 30 points

### Checkout at completed transaction flow — 10 points

- **📍 Lokasyon:** [Order summary](./frontend/src/Components/Cart/ConfirmOrder.jsx), [Place-order form](./frontend/src/Components/Cart/Payment.jsx), [Order validation at creation](./backend/controllers/order.js#L59), [Order schema at statuses](./backend/models/order.js#L56).
- **⚙️ Paano gumagana:** Nagpapadala ang checkout ng cart items at shipping info. Muling kinukuha ng backend ang product prices, chine-check ang stock, kinukuwenta ang totals, at gumagawa ng Pending order. Walang payment-method form dahil hindi ito hinihingi ng rubric.
- **🗣️ Demo script:** *“Sir, gumagawa po ng Pending order ang checkout at server ang nagva-validate ng presyo at stock. Ang admin ang nag-a-update ng order status hanggang makumpleto.”*

### Admin status management — 5 points

- **📍 Lokasyon:** [Admin process-order page](./frontend/src/Components/Admin/ProcessOrder.jsx#L130), [Protected order update route](./backend/routes/order.js#L25), [Status transition and inventory update](./backend/controllers/order.js#L200).
- **⚙️ Paano gumagana:** Apat ang pangunahing status choices sa admin: `Pending`, `Processing`, `Completed`, at `Cancelled`. Isinasave ng backend ang status, ina-adjust ang inventory ayon sa lifecycle, at ipinapadala ang status email at receipt.
- **🗣️ Demo script:** *“Sir, pinasimple po ang transaction flow sa Pending, Processing, Completed, at Cancelled. Sa status update ina-adjust ng backend ang inventory at nagpapadala ng customer notification.”*

### Automated email na may order details — 5 points

- **📍 Lokasyon:** [Order email template at status handler](./backend/controllers/order.js#L173), [Nodemailer service](./backend/utils/sendEmail.js#L3).
- **⚙️ Paano gumagana:** Kapag nag-update ng status, binubuo ang email na may order items, quantity, unit prices, subtotals, tax, shipping, at grand total. Gumagamit ang email service ng SMTP settings mula sa environment.
- **🗣️ Demo script:** *“Sir, kapag nag-update ng order status, nagpapadala po ang backend ng email na may itemized order at breakdown ng subtotal hanggang grand total.”*

### PDF receipt attachment — 10 points

- **📍 Lokasyon:** [PDF generator](./backend/utils/generateReceipt.js#L8), [Email attachment setup](./backend/controllers/order.js#L293).
- **⚙️ Paano gumagana:** Gumagawa ang PDFKit ng receipt buffer sa memory na may customer, order items, subtotals, tax, shipping, at total. Ikinakabit ang PDF sa status email bilang `application/pdf`.
- **🗣️ Demo script:** *“Sir, dynamic po ang PDF receipt: ginagawa ito mula sa order details at diretsong ikinakabit sa customer email.”*
- **Demo prerequisite:** Kailangan ng gumaganang SMTP configuration at test inbox para makita ang aktuwal na email.

## 5. Unit 1: Content Moderation & Security Validation — 20 points

### Profanity filtering — 10 points

- **📍 Lokasyon:** [Profanity filter setup at review sanitization](./backend/controllers/product.js#L4), [Dependency](./backend/package.json).
- **⚙️ Paano gumagana:** Bago i-save ang review, pinoproseso ang comment gamit ang `bad-words`. Ang nalinis na comment ang iniimbak at ibinabalik ng API.
- **🗣️ Demo script:** *“Sir, server-side po nililinis ang review comment gamit ang `bad-words` bago ito i-save, kaya hindi lang frontend validation ang umaasa sa moderation.”*

### Comprehensive form validation — 10 points

- **📍 Lokasyon:** [Yup schemas](./frontend/src/utils/validationSchemas.js#L11), [Product create form](./frontend/src/Components/Admin/NewProduct.jsx#L21), [Product update form](./frontend/src/Components/Admin/UpdateProduct.jsx#L46), [Login form](./frontend/src/Components/User/Login.jsx#L22), [Profile update form](./frontend/src/Components/User/UpdateProfile.jsx#L20), [Server validation](./backend/controllers/auth.js#L244).
- **⚙️ Paano gumagana:** Formik ang nagma-manage ng form state at Yup ang nagva-validate ng product, login, at profile inputs. May backend validation din para hindi mapagkatiwalaan nang buo ang client-supplied values.
- **🗣️ Demo script:** *“Sir, Formik at Yup ang gamit sa frontend forms, at inuulit ng backend ang mahahalagang validation bago tumanggap ng data.”*

## 6. Unit 2: UI/UX Architecture & Styling — 20 points

### Component libraries at custom CSS — 20 points

- **📍 Lokasyon:** [MUI Data Grid](./frontend/src/Components/Admin/ProductsList.jsx#L230), [Admin dashboard](./frontend/src/Components/Admin/Dashboard.jsx), [Custom app CSS](./frontend/src/App.css), [Global CSS](./frontend/src/index.css), [UI dependencies](./frontend/package.json).
- **⚙️ Paano gumagana:** Gumagamit ang admin screens ng MUI components at Data Grid; ginagamit din ang React Bootstrap classes at custom CSS para sa layout, styling, at branding.
- **🗣️ Demo script:** *“Sir, pinagsasama po ng project ang MUI, Bootstrap, at custom CSS para sa reusable components at sariling Pizzaro interface.”*

## 7. Quiz 1: Analytics & Reporting — 15 points

### Sales chart at date-range filter — 15 points

- **📍 Lokasyon:** [Date filters at line chart](./frontend/src/Components/Admin/MonthlySalesChart.jsx#L52), [Sales aggregation endpoint](./backend/controllers/order.js#L475), [Admin-only route](./backend/routes/order.js#L31).
- **⚙️ Paano gumagana:** Recharts line chart ang nagpapakita ng daily totals ng completed orders. Maaaring pumili ng 7 days, 30 days, current month, o custom date range; kino-query ng backend ang completed orders batay sa completion date.
- **🗣️ Demo script:** *“Sir, nagbabago po ang daily sales chart ayon sa napiling date range. Completed orders lang ang kasama sa sales data.”*

## 8. Quiz 2: Performance & Data Presentation — 15 points

### Homepage product pagination — 15 points

- **📍 Lokasyon:** [Homepage pagination controls](./frontend/src/Components/Home.jsx#L326), [Page query builder](./frontend/src/actions/productActions.jsx#L28), [Server page size and result counts](./backend/controllers/product.js#L125), [Limit/skip logic](./backend/utils/apiFeatures.js#L57).
- **⚙️ Paano gumagana:** Ipinapadala ng frontend ang kasalukuyang page. Nililimitahan ng backend sa apat na products ang bawat response at ginagamit ang `limit` at `skip`; ipinapadala rin nito ang bilang ng filtered results para sa page controls.
- **🗣️ Demo script:** *“Sir, server-side po ang homepage pagination. Apat na products kada page ang kinukuha ng API gamit ang limit at skip.”*

## 9. Quiz 3: Authentication & OAuth — 15 points

### Google at Facebook sign-in — 15 points

- **📍 Lokasyon:** [Social login buttons](./frontend/src/Components/User/SocialLoginButtons.jsx#L40), [Firebase client configuration](./frontend/src/utils/firebase.js#L1), [Firebase Admin setup](./backend/config/firebaseAdmin.js#L1), [Token verification](./backend/controllers/auth.js#L80), [Social login route](./backend/routes/socialAuth.js#L6).
- **⚙️ Paano gumagana:** Firebase Authentication ang nagbubukas ng Google o Facebook sign-in popup. Ipinapadala ang Firebase ID token sa backend at bine-verify ito bago mag-set ng Pizzaro user session.
- **🗣️ Demo script:** *“Sir, Firebase OAuth po ang ginagamit para sa Google at Facebook login. Vine-verify muna ng backend ang ID token bago magbigay ng app session.”*
- **Demo prerequisite:** Kailangang may valid Firebase client settings, server credentials, at enabled Google/Facebook providers sa Firebase Console.

## 10. Quiz 4: State Management — 15 points

### Redux integration — 15 points

- **📍 Lokasyon:** [Redux store at combined reducers](./frontend/src/store.js#L47), [Redux Provider](./frontend/src/main.jsx#L12), [Cart reducer](./frontend/src/reducers/cartReducers.js), [User reducer](./frontend/src/reducers/userReducers.jsx), [Order reducer](./frontend/src/reducers/orderReducers.js).
- **⚙️ Paano gumagana:** Pinagsasama ng Redux store ang product, cart, user, at order state; nagbibigay ang Provider ng access nito sa React components. Gumagamit ang store ng Redux Thunk para sa asynchronous API actions.
- **🗣️ Demo script:** *“Sir, Redux ang nagma-manage ng shared cart, user, product, at order state para magamit ito ng iba’t ibang screens.”*
- **Tandaan:** Redux at Redux Thunk ang implementation dito; hindi Redux Toolkit slices.

## 11. Term Test LEC: System Quality & Integrity — 30 points

### Functional requirements completeness — 10 points

- **📍 Lokasyon:** Mga feature locations sa itaas at [API routes](./backend/routes/).
- **⚙️ Paano gumagana:** Saklaw ng application ang catalog management, filtering, reviews, orders, admin operations, analytics, authentication, at state management. Walang payment-method o payment-processing feature dahil hindi ito requirement sa rubric.
- **🗣️ Demo script:** *“Sir, ito po ang pangunahing feature coverage ng system. Ang transaction ay tina-track sa order lifecycle; walang payment processing dahil wala ito sa rubric.”*

### Program execution at error handling — 10 points

- **📍 Lokasyon:** [Global Express error middleware](./backend/app.js#L24), [Order validation/errors](./backend/controllers/order.js#L59), [Product validation/errors](./backend/controllers/product.js#L101), [Frontend notifications](./frontend/src/App.jsx#L276).
- **⚙️ Paano gumagana:** May centralized Express middleware para sa uncaught route errors at JSON error responses. Nagpapakita rin ang frontend ng errors sa UI/toasts para makita ng user kapag nabigo ang request.
- **🗣️ Demo script:** *“Sir, centralized ang backend error middleware at may user-facing error states sa frontend. Kapag pumalya ang request, may malinaw na error response o notification.”*
- **Tandaan:** Huwag mag-claim ng React Error Boundary; hindi iyon bahagi ng kasalukuyang implementation.

### Project contribution at code structure — 10 points

- **📍 Lokasyon:** [Backend controllers, models, routes, utilities, at tests](./backend/), [Frontend components, actions, reducers, at utilities](./frontend/src/).
- **⚙️ Paano gumagana:** Hiwalay ang API routes, controller logic, database models, at shared utilities sa backend. Sa frontend naman, magkakahiwalay ang screens/components, Redux actions/reducers, at validation utilities.
- **🗣️ Demo script:** *“Sir, modular po ang project structure. Naka-separate ang UI, state management, API routes, business logic, database models, at reusable utilities.”*
- **Automated checks:** Backend tests sa [backend/test/](./backend/test/); patakbuhin ang `npm --prefix backend test`, `npm --prefix frontend run lint`, at `npm --prefix frontend run build`.

## Suggested demo order

1. Ipakita ang homepage; subukan ang price, category, rating, at review filters at magpalit ng page.
2. Mag-login bilang admin; ipakita ang product table, multiple image upload, edit, at checkbox bulk delete.
3. Ipakita ang review authorization at admin moderation.
4. Gumawa ng order; ipakita ang Pending status, pagkatapos ay bilang admin baguhin ang status at tingnan ang email/receipt.
5. Ipakita ang status email at PDF receipt kung naka-configure ang SMTP test inbox.
6. Ipakita ang sales chart at date range.
7. Ipakita ang Google/Facebook login kung naka-configure ang Firebase providers.
8. Patakbuhin ang backend tests, frontend lint, at production build.

## Security at configuration reminder

Huwag ilagay ang secrets sa Git, README, screenshots, o demo recordings. Na-expose ang credentials sa naunang IDE selection/chat; palitan ang mga ito sa MongoDB, Cloudinary, SMTP, at Firebase consoles, at gumawa ng bagong JWT secret. I-update ang local ignored `.env` files gamit ang bagong credentials. Huwag ipadala rito ang mga bagong secret values.

## Reusable code-walkthrough prompt

```text
Ikaw ay isang Senior Software Engineer at Code Reviewer. I-audit at ipaliwanag ang Pizzaro codebase ayon sa 220-point rubric sa root README.md.

Para sa bawat sub-requirement:
1. Tukuyin ang aktuwal na file path at kasalukuyang line number.
2. Ipaliwanag sa maikli at malinaw na modern Taglish kung paano gumagana ang implementation.
3. Magbigay ng maikling presentation script na nagsisimula sa “Sir, ...”.
4. Ihiwalay ang implemented, partially implemented, at missing.
5. Huwag gumamit ng generic o hindi umiiral na paths; i-verify ang code bago mag-claim.
6. Banggitin ang edge cases, configuration, tests, at demo prerequisites.
7. Huwag mag-claim ng payment method o payment processing; hindi ito kasama sa requirements rubric.

Saklaw: product CRUD, image upload at bulk delete; advanced filters; review authorization/editing/moderation; checkout, status changes, email at PDF receipt; profanity filter at form validation; UI libraries; sales chart/date filters; pagination; Firebase Google/Facebook OAuth; Redux; error handling; at project structure.
```
