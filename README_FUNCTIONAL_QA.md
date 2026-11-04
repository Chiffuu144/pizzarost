# Pizzaro Functional Requirements: Posibleng Tanong at Sagot

Gamitin ang gabay na ito bilang reviewer para sa project demo o defense. Para sa bawat requirement, nakalista ang posibleng tanong ni Sir, kung saang file bubuksan ang code, anong function o logic ang ituturo, paano ito gumagana, at isang maikling sagot na puwedeng sabihin sa demo.

> **Tapat na demo:** Ipakita lamang ang behavior na aktuwal na nasa code. Walang payment method o payment processing sa system dahil hindi ito requirement sa rubric. Ang review filter ay para sa pagkakaroon ng reviews, hindi eksaktong review-count range. Kailangan ng valid local configuration para sa database, email, Cloudinary, at Firebase integrations.

## Mabilis na mapa ng system

| Layer | Saan titingin | Papel |
|---|---|---|
| Frontend | [`frontend/src/Components/`](./frontend/src/Components/) | Mga pahina, forms, tables, checkout, at admin interface |
| Redux | [`frontend/src/store.js`](./frontend/src/store.js), [`frontend/src/actions/`](./frontend/src/actions/), [`frontend/src/reducers/`](./frontend/src/reducers/) | Shared application state at asynchronous API calls |
| API routes | [`backend/routes/`](./backend/routes/) | HTTP endpoints at authentication/role guards |
| Business logic | [`backend/controllers/`](./backend/controllers/) | Product, review, order, user, at analytics behavior |
| Database | [`backend/models/`](./backend/models/) | MongoDB/Mongoose schemas |
| Shared backend utilities | [`backend/utils/`](./backend/utils/) | Filtering, uploads, lifecycle rules, email, at PDF generation |

---

## 1. MP1 — Core Management (20 points)

### Product CRUD at data table — 5 points

- **Posibleng tanong:** “Saan ginagawa ang product create, view, update, at delete?”
- **Lokasyon:** [`ProductsList.jsx`](./frontend/src/Components/Admin/ProductsList.jsx), [`NewProduct.jsx`](./frontend/src/Components/Admin/NewProduct.jsx), [`UpdateProduct.jsx`](./frontend/src/Components/Admin/UpdateProduct.jsx), [`backend/routes/product.js`](./backend/routes/product.js), [`backend/controllers/product.js`](./backend/controllers/product.js).
- **Code na ituturo:** `ProductsList` Data Grid at row actions; `newProduct`, `getProducts`, `updateProduct`, at `deleteProduct` controller handlers; admin-protected product routes.
- **Paano gumagana:** Ipinapakita ng admin table ang products at nagbibigay ng create, edit, at delete actions. Tinatawag ng frontend ang API; ang backend route ang nagche-check ng admin access bago patakbuhin ang controller at i-update ang MongoDB.
- **Sagot kay Sir:** *“Sir, dito po sa Products admin table nakikita ang records at dito rin nagsisimula ang create, edit, at delete actions. Sa backend controller naman ipinapatupad ang pagbabago sa database, at admin-only ang mga route.”*

### Multiple photo uploads — 5 points

- **Posibleng tanong:** “Paano nag-a-upload ng maraming larawan ang isang product?”
- **Lokasyon:** [`NewProduct.jsx`](./frontend/src/Components/Admin/NewProduct.jsx), [`UpdateProduct.jsx`](./frontend/src/Components/Admin/UpdateProduct.jsx), [`backend/utils/multer.js`](./backend/utils/multer.js), [`backend/utils/productImages.js`](./backend/utils/productImages.js), [`backend/routes/product.js`](./backend/routes/product.js).
- **Code na ituturo:** Multi-file input at FormData creation sa product forms; Multer image limits; upload/cleanup helpers sa `productImages`.
- **Paano gumagana:** Pinipili ng admin ang maraming image files. Sinasala muna ng upload middleware ang type, size, at count, saka ina-upload ang valid images sa Cloudinary at sine-save ang image references sa product.
- **Sagot kay Sir:** *“Sir, multiple files po ang tinatanggap ng product form. Bago i-save, vine-validate ng backend ang images at ina-upload ang mga valid file sa Cloudinary.”*

### Bulk delete gamit ang checkboxes — 10 points

- **Posibleng tanong:** “Paano sabay-sabay na nagde-delete ng products?”
- **Lokasyon:** [`ProductsList.jsx`](./frontend/src/Components/Admin/ProductsList.jsx), [`backend/routes/product.js`](./backend/routes/product.js), [`backend/controllers/product.js`](./backend/controllers/product.js).
- **Code na ituturo:** Data Grid checkbox selection model at bulk-delete action; `deleteProducts` handler; admin-protected bulk endpoint.
- **Paano gumagana:** Kinokolekta ng table ang selected product IDs. Pagkatapos ng confirmation, ipinapadala ang listahan sa backend; vini-validate ng server ang IDs/batch at nililinis din ang kaugnay na product images.
- **Sagot kay Sir:** *“Sir, pinipili po muna ang maraming rows gamit ang checkboxes. Isang request lang ang ipinapadala sa bulk-delete endpoint, pero server pa rin ang nagva-validate bago mag-delete.”*

## 2. MP2 — Advanced Filtering (20 points)

### Price filter — 5 points

- **Posibleng tanong:** “Saan at paano nagfi-filter ayon sa presyo?”
- **Lokasyon:** [`Home.jsx`](./frontend/src/Components/Home.jsx), [`productActions.jsx`](./frontend/src/actions/productActions.jsx), [`apiFeatures.js`](./backend/utils/apiFeatures.js).
- **Code na ituturo:** Minimum/maximum price inputs; query parameter builder; MongoDB `$gte` at `$lte` price conditions.
- **Paano gumagana:** Ipinapadala ng homepage ang min/max values bilang query parameters. Binubuo ng `APIFeatures.filter()` ang database conditions para isama lamang ang pasok sa itinakdang range.
- **Sagot kay Sir:** *“Sir, dito po sa homepage inilalagay ang minimum at maximum price. Ipinapasa ang values sa API at ginagamit ng backend ang `$gte` at `$lte` para salain ang products.”*

### Category filter — 5 points

- **Posibleng tanong:** “Paano pinipili ang products ayon sa category?”
- **Lokasyon:** [`Home.jsx`](./frontend/src/Components/Home.jsx), [`productActions.jsx`](./frontend/src/actions/productActions.jsx), [`apiFeatures.js`](./backend/utils/apiFeatures.js).
- **Code na ituturo:** Category selector/state sa homepage; category query parameter; category filtering sa `APIFeatures.filter()`.
- **Paano gumagana:** Ipinapadala ang napiling category kasama ng catalog request. Ina-apply ng backend ang category condition bago ibalik ang results.
- **Sagot kay Sir:** *“Sir, kapag pumili po ng category, ipinapadala ito bilang query parameter at backend ang nagbabalik ng products na tumutugma roon.”*

### Ratings filter — 5 points

- **Posibleng tanong:** “Ano ang ibig sabihin ng rating filter at paano ito kino-compute?”
- **Lokasyon:** [`Home.jsx`](./frontend/src/Components/Home.jsx), [`productActions.jsx`](./frontend/src/actions/productActions.jsx), [`apiFeatures.js`](./backend/utils/apiFeatures.js), [`product.js`](./backend/controllers/product.js).
- **Code na ituturo:** Minimum-rating selector; rating query; `$gte` comparison; review submission code na nag-a-update ng product average.
- **Paano gumagana:** Pinipili ng user ang minimum star rating. Ikinukumpara ito ng backend sa naka-store na product rating. Ina-update ang product rating kapag may review na naisumite.
- **Sagot kay Sir:** *“Sir, minimum rating po ang filter. Ikinukumpara ng backend ang napiling stars sa rating ng product gamit ang greater-than-or-equal condition.”*

### Review count/presence filter — 5 points

- **Posibleng tanong:** “Puwede bang mag-filter ayon sa dami ng reviews?”
- **Lokasyon:** [`Home.jsx`](./frontend/src/Components/Home.jsx), [`productActions.jsx`](./frontend/src/actions/productActions.jsx), [`apiFeatures.js`](./backend/utils/apiFeatures.js).
- **Code na ituturo:** `hasReviews` checkbox/state at `numOfReviews > 0` condition.
- **Paano gumagana:** Puwedeng ipakita lamang ang products na may kahit isang review. **Presence-based** ito; hindi kasalukuyang nagtatakda ng minimum o eksaktong review count.
- **Sagot kay Sir:** *“Sir, may filter po para sa products na may reviews. Presence lang po ang sinusuri nito; wala pang numeric filter para pumili ng eksaktong review count.”*

## 3. MP3 — Review & Rating System (20 points)

### Customer authorization sa pag-review — 10 points

- **Posibleng tanong:** “Paano ninyo sinisigurong totoong customer lang ang makakapag-review?”
- **Lokasyon:** [`backend/routes/product.js`](./backend/routes/product.js), [`product.js`](./backend/controllers/product.js), [`orderLifecycle.js`](./backend/utils/orderLifecycle.js).
- **Code na ituturo:** Authenticated review route; `reviewableOrderFilter(userId, productId)`; order owner, completed/delivered status, at order item/product match.
- **Paano gumagana:** Bago gumawa ng bagong review, tinitingnan ng server kung ang kasalukuyang user ay may completed/delivered order na naglalaman ng product. Hindi sapat ang frontend button o client-supplied user ID.
- **Sagot kay Sir:** *“Sir, backend po ang nagche-check ng order owner, product, at completed transaction bago payagan ang bagong review.”*

### Pag-update ng sariling review — 5 points

- **Posibleng tanong:** “Paano kung gusto ng customer na i-edit ang review niya?”
- **Lokasyon:** [`ProductDetails.jsx`](./frontend/src/Components/Product/ProductDetails.jsx), [`product.js`](./backend/controllers/product.js).
- **Code na ituturo:** Review form state/submit action sa `ProductDetails`; `createProductReview` handler na naghahanap ng existing review gamit ang authenticated user.
- **Paano gumagana:** Kapag may existing review na ang user sa product, ina-update ang rating/comment ng review na iyon sa halip na gumawa ng panibagong duplicate. Ang identity ay galing sa authenticated session.
- **Sagot kay Sir:** *“Sir, sa pag-submit po, hinahanap muna ng backend ang existing review ng kasalukuyang naka-login na user. Kung mayroon, iyon ang ina-update kaya hindi nadodoble ang review.”*

### Admin moderation — 5 points

- **Posibleng tanong:** “Saan nagtatanggal ang admin ng inappropriate reviews?”
- **Lokasyon:** [`ProductReviews.jsx`](./frontend/src/Components/Admin/ProductReviews.jsx), [`backend/routes/product.js`](./backend/routes/product.js), [`product.js`](./backend/controllers/product.js).
- **Code na ituturo:** Admin moderation table at delete confirmation; admin-protected delete-review route; `deleteReview` controller.
- **Paano gumagana:** Hinahanap ng admin ang reviews para sa product at nagde-delete mula sa moderation screen. Ang server-side role guard ang naglilimita ng delete operation sa admin.
- **Sagot kay Sir:** *“Sir, dito po sa Product Reviews admin page hinahanap at mina-moderate ang reviews. Admin-only ang delete endpoint kaya hindi ito basta magagamit ng customer.”*

## 4. Term Test LAB — E-Commerce & Transaction Lifecycle (30 points)

### Checkout at completed transaction flow — 10 points

- **Posibleng tanong:** “Ano ang buong daloy mula cart hanggang completed order?”
- **Lokasyon:** [`Cart.jsx`](./frontend/src/Components/Cart/Cart.jsx), [`Shipping.jsx`](./frontend/src/Components/Cart/Shipping.jsx), [`ConfirmOrder.jsx`](./frontend/src/Components/Cart/ConfirmOrder.jsx), [`Payment.jsx`](./frontend/src/Components/Cart/Payment.jsx), [`order.js`](./backend/controllers/order.js), [`order.js`](./backend/models/order.js).
- **Code na ituturo:** `newOrder` handler; server-side product/stock/price lookup at total calculation; initial `Pending` order status.
- **Paano gumagana:** Dumadaan ang customer sa cart, shipping, order review, at place-order steps. Muling vini-validate ng backend ang products, prices, stock, at totals bago gumawa ng Pending order; admin ang nag-a-update ng kasunod na status.
- **Sagot kay Sir:** *“Sir, checkout po muna ang customer at gumagawa ang backend ng Pending order matapos i-check ulit ang presyo at stock. Admin po ang nag-a-update ng status hanggang makumpleto ang transaction.”*
- **Tandaan:** Walang payment-method form o payment processing dahil hindi ito hinihingi ng rubric.

### Admin status management — 5 points

- **Posibleng tanong:** “Paano ina-update ng admin ang order status at paano naa-adjust ang inventory?”
- **Lokasyon:** [`ProcessOrder.jsx`](./frontend/src/Components/Admin/ProcessOrder.jsx), [`backend/routes/order.js`](./backend/routes/order.js), [`order.js`](./backend/controllers/order.js), [`orderLifecycle.js`](./backend/utils/orderLifecycle.js).
- **Code na ituturo:** Admin status selector; `updateOrder`; inventory adjustment at customer notification.
- **Paano gumagana:** Apat ang pangunahing status choices sa admin: `Pending`, `Processing`, `Completed`, at `Cancelled`. Ipinapakita bilang `Completed` ang mga dating `Delivered` orders; nananatili lang ang `Shipped` bilang legacy value para sa lumang records.
- **Sagot kay Sir:** *“Sir, pinasimple po ang order flow sa Pending, Processing, Completed, at Cancelled. Ina-update ng backend ang inventory at nagpapadala ng email receipt kapag nagbago ang status.”*

### Automated email na may order details — 5 points

- **Posibleng tanong:** “Anong laman ng email na ipinapadala kapag nagbago ang order?”
- **Lokasyon:** [`order.js`](./backend/controllers/order.js), [`sendEmail.js`](./backend/utils/sendEmail.js).
- **Code na ituturo:** Email options na binubuo sa `updateOrder`; Nodemailer `sendEmail()` service.
- **Paano gumagana:** Sa status update, binubuo ng backend ang notification na may order items, quantities, prices, subtotals, at order totals. Ipinapadala ito gamit ang SMTP configuration.
- **Sagot kay Sir:** *“Sir, kapag nag-update po ng order, gumagawa ang backend ng itemized email na may quantities at total breakdown, tapos ipinapadala ito sa configured SMTP service.”*
- **Demo note:** Kailangan ng valid SMTP settings at test inbox para makita ang aktuwal na email.

### PDF receipt attachment — 10 points

- **Posibleng tanong:** “Paano ginagawa ang PDF receipt at paano ito nakakabit sa email?”
- **Lokasyon:** [`generateReceipt.js`](./backend/utils/generateReceipt.js), [`order.js`](./backend/controllers/order.js), [`sendEmail.js`](./backend/utils/sendEmail.js).
- **Code na ituturo:** `generateReceipt(order)`; PDF buffer creation; email attachment na may PDF content type.
- **Paano gumagana:** Ginagawa ng PDFKit ang receipt sa memory mula sa order/customer details, line items, subtotal, tax, shipping, at total. Ipinapasa ang PDF buffer bilang attachment sa status email.
- **Sagot kay Sir:** *“Sir, dynamic po ang receipt dahil galing ito sa aktuwal na order record. Ginagawa ito bilang PDF buffer at ikinakabit sa email nang hindi kailangang gumawa muna ng permanenteng PDF file.”*

## 5. Unit 1 — Content Moderation & Validation (20 points)

### Profanity filtering — 10 points

- **Posibleng tanong:** “Saan hina-handle ang masasamang salita sa review?”
- **Lokasyon:** [`product.js`](./backend/controllers/product.js), [`backend/package.json`](./backend/package.json).
- **Code na ituturo:** `Filter` mula sa `bad-words`; `profanityFilter.clean(...)` sa review comment bago ito i-save.
- **Paano gumagana:** Nililinis ng backend ang incoming review comment bago ito idagdag sa product reviews. Server-side ito kaya hindi nakadepende sa browser-side filter lamang.
- **Sagot kay Sir:** *“Sir, bago i-save ang review, nililinis muna ng backend ang comment gamit ang `bad-words`. Kaya kahit direktang API request, dumadaan pa rin ito sa moderation logic.”*

### Form validation — 10 points

- **Posibleng tanong:** “Paano vine-validate ang Product, Login, at Profile forms?”
- **Lokasyon:** [`validationSchemas.js`](./frontend/src/utils/validationSchemas.js), [`NewProduct.jsx`](./frontend/src/Components/Admin/NewProduct.jsx), [`UpdateProduct.jsx`](./frontend/src/Components/Admin/UpdateProduct.jsx), [`Login.jsx`](./frontend/src/Components/User/Login.jsx), [`UpdateProfile.jsx`](./frontend/src/Components/User/UpdateProfile.jsx), [`auth.js`](./backend/controllers/auth.js).
- **Code na ituturo:** Formik `useFormik`; `validationSchema`; Yup schema definitions; backend validation sa auth/profile handlers.
- **Paano gumagana:** Pinamamahalaan ng Formik ang form state at errors; Yup ang naglalarawan ng input rules para sa forms. Inuulit ng backend ang mahahalagang checks dahil hindi mapagkakatiwalaan ang validation sa client lamang.
- **Sagot kay Sir:** *“Sir, Formik at Yup po ang ginagamit para sa frontend form state at validation, tapos may server-side checks din para hindi makalusot ang invalid request mula sa ibang client.”*

## 6. Unit 2 — UI/UX Architecture & Styling (20 points)

### UI library at custom CSS — 20 points

- **Posibleng tanong:** “Anong UI libraries at styling approach ang ginamit?”
- **Lokasyon:** [`frontend/package.json`](./frontend/package.json), [`ProductsList.jsx`](./frontend/src/Components/Admin/ProductsList.jsx), [`Dashboard.jsx`](./frontend/src/Components/Admin/Dashboard.jsx), [`App.css`](./frontend/src/App.css), [`index.css`](./frontend/src/index.css).
- **Code na ituturo:** MUI Data Grid/components; React Bootstrap usage; project-specific selectors sa custom CSS.
- **Paano gumagana:** Pinagsasama ng UI ang MUI para sa reusable components/data tables, React Bootstrap para sa layout/utilities, at custom CSS para sa sariling Pizzaro branding at responsive styling.
- **Sagot kay Sir:** *“Sir, hindi po CSS lang ang gamit. May MUI components, React Bootstrap, at custom CSS para sa reusable controls at sariling responsive design ng Pizzaro.”*

## 7. Quiz 1 — Analytics & Reporting (15 points)

### Sales chart at date-range filter — 15 points

- **Posibleng tanong:** “Paano nagbabago ang sales chart kapag nagpalit ng date range?”
- **Lokasyon:** [`MonthlySalesChart.jsx`](./frontend/src/Components/Admin/MonthlySalesChart.jsx), [`order.js`](./backend/controllers/order.js), [`backend/routes/order.js`](./backend/routes/order.js).
- **Code na ituturo:** Date range/preset state at sales fetch sa `MonthlySalesChart`; `salesPerDay` aggregation; admin-protected `/admin/sales-per-day` route.
- **Paano gumagana:** Nagpapadala ang chart ng start/end date sa admin API. Ina-aggregate ng backend ang paid, completed orders sa napiling period at ibinabalik ang daily revenue series para sa Recharts line chart.
- **Sagot kay Sir:** *“Sir, puwedeng pumili ng preset o custom date range. Ipinapasa iyon sa sales endpoint at paid, completed orders lang ang kasama sa revenue chart.”*

## 8. Quiz 2 — Performance & Data Presentation (15 points)

### Homepage product pagination — 15 points

- **Posibleng tanong:** “Client-side ba o server-side ang pagination?”
- **Lokasyon:** [`Home.jsx`](./frontend/src/Components/Home.jsx), [`productActions.jsx`](./frontend/src/actions/productActions.jsx), [`product.js`](./backend/controllers/product.js), [`apiFeatures.js`](./backend/utils/apiFeatures.js).
- **Code na ituturo:** Current page state at pagination controls; page query parameter; `pagination(resPerPage)` at MongoDB `limit`/`skip`.
- **Paano gumagana:** Ipinapadala ng homepage ang page number sa API. Nililimitahan ng backend ang query sa apat na products kada page at ibinabalik ang count ng filtered results para sa controls.
- **Sagot kay Sir:** *“Sir, server-side po ang homepage pagination. Page number ang ipinapadala ng frontend at apat na matching products kada page ang kinukuha ng backend gamit ang limit at skip.”*

## 9. Quiz 3 — Authentication & OAuth (15 points)

### Google/Facebook social login — 15 points

- **Posibleng tanong:** “Paano ninyo vine-verify na valid ang Google o Facebook login?”
- **Lokasyon:** [`SocialLoginButtons.jsx`](./frontend/src/Components/User/SocialLoginButtons.jsx), [`firebase.js`](./frontend/src/utils/firebase.js), [`firebaseAdmin.js`](./backend/config/firebaseAdmin.js), [`auth.js`](./backend/controllers/auth.js), [`socialAuth.js`](./backend/routes/socialAuth.js).
- **Code na ituturo:** Firebase `GoogleAuthProvider` at `FacebookAuthProvider`; client ID-token submission; Firebase Admin token verification; Pizzaro session creation.
- **Paano gumagana:** Firebase Auth ang nag-a-authenticate sa provider. Ipinapadala ng frontend ang Firebase ID token sa backend; ibe-verify ito ng Firebase Admin bago gumawa o maghanap ng Pizzaro user at magbigay ng app session.
- **Sagot kay Sir:** *“Sir, Firebase po ang humahawak sa Google/Facebook authentication. Hindi basta pinagkakatiwalaan ng backend ang frontend result; vine-verify muna nito ang ID token bago mag-login sa Pizzaro.”*
- **Demo note:** Kailangang enabled ang providers sa Firebase Console at tama ang local Firebase configuration.

## 10. Quiz 4 — State Management (15 points)

### Redux integration — 15 points

- **Posibleng tanong:** “Anong global state manager ang gamit at anong state ang pinamamahalaan?”
- **Lokasyon:** [`store.js`](./frontend/src/store.js), [`main.jsx`](./frontend/src/main.jsx), [`reducers/`](./frontend/src/reducers/), [`actions/`](./frontend/src/actions/).
- **Code na ituturo:** `combineReducers`, `createStore`, Redux Thunk middleware, Redux `<Provider>`, cart/user/product/order reducers.
- **Paano gumagana:** Pinagsasama ng store ang reducers at ibinibigay ito sa React tree sa pamamagitan ng Provider. Redux Thunk actions ang humahawak sa asynchronous API calls at nagdi-dispatch ng updates sa shared state.
- **Sagot kay Sir:** *“Sir, Redux po ang central store para sa cart, user, products, at orders. Provider ang nagbabahagi nito sa components at Thunk ang tumutulong sa asynchronous API actions.”*
- **Tandaan:** Redux at Redux Thunk ang gamit; hindi Redux Toolkit slices.

## 11. Term Test LEC — System Quality & Integrity (30 points)

### Functional requirements completeness — 10 points

- **Posibleng tanong:** “Aling pangunahing user needs ang sinasagot ng system?”
- **Lokasyon:** Ipakita ang relevant files sa sections 1–10 sa itaas at ang [`backend/routes/`](./backend/routes/).
- **Code na ituturo:** Product catalog/admin management, filtering, cart/checkout, reviews, OAuth, order management, email/receipt, at analytics routes/components.
- **Paano gumagana:** Frontend screens ang nagbibigay ng user/admin workflows; routes ang nag-e-expose ng API; controllers at models ang nagpapatupad at nagpe-persist ng business data.
- **Sagot kay Sir:** *“Sir, saklaw po ng system ang product management at discovery, customer reviews, checkout/order management, admin analytics, at authentication. Walang payment processing dahil hindi ito bahagi ng rubric.”*

### Program execution at error handling — 10 points

- **Posibleng tanong:** “Saan hinahandle ang errors kapag pumalya ang API?”
- **Lokasyon:** [`backend/app.js`](./backend/app.js), [`order.js`](./backend/controllers/order.js), [`product.js`](./backend/controllers/product.js), [`App.jsx`](./frontend/src/App.jsx).
- **Code na ituturo:** Express error middleware sa dulo ng `app.js`; controller validation/error responses; frontend loading/error notifications.
- **Paano gumagana:** Naka-mount ang routes pagkatapos ng parsing middleware. Kapag nagpasa ng error ang route/controller, tinatanggap ito ng centralized middleware; kung nakapagsimula na ang response, ipinapasa nito sa susunod na Express handler. Ibinabalik nito ang structured JSON error at hindi inilalantad sa client ang internal message para sa ordinaryong server error.
- **Sagot kay Sir:** *“Sir, centralized po ang Express error middleware sa `backend/app.js`. Tinutukoy nito ang validation, invalid ObjectId, at upload-limit errors, at nagbabalik ng JSON response; sa frontend naman may error states o notifications.”*
- **Tandaan:** Huwag sabihing may React Error Boundary; hindi iyon bahagi ng current implementation.

### Project contribution at code structure — 10 points

- **Posibleng tanong:** “Paano ninyo inayos ang code para madaling i-maintain?”
- **Lokasyon:** [`backend/`](./backend/), [`frontend/src/`](./frontend/src/), [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md).
- **Code na ituturo:** Routes/controllers/models/utils sa backend; components/actions/reducers/validation utilities sa frontend; automated tests sa [`backend/test/`](./backend/test/).
- **Paano gumagana:** Nakahiwalay ang UI, API routing, business logic, persistence, reusable utilities, at tests. Dahil dito, mas madaling makita kung saan babaguhin ang isang behavior at paano ito i-test.
- **Sagot kay Sir:** *“Sir, modular po ang project. Hiwalay ang frontend components at state management sa backend routes, controllers, models, at utilities; mayroon ding backend tests para sa mahahalagang rules.”*
- **Validation commands:** `npm --prefix backend test`, `npm --prefix frontend run lint`, at `npm --prefix frontend run build`.

---

## Focus walkthrough: `backend/app.js`

Kapag tinanong ni Sir kung paano naka-set up ang API at saan dumadaan ang errors, buksan ang [`backend/app.js`](./backend/app.js) at ituro ang mga sumusunod:

### 1. Express app at route imports

```js
const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const products = require('./routes/product');
const auth = require('./routes/auth');
const socialAuth = require('./routes/socialAuth');
const order = require('./routes/order');
```

**Paliwanag:** Gumagawa ito ng Express application at ini-import ang route modules para sa products, authentication, social login, at orders.

### 2. Request middleware

```js
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
```

**Paliwanag:** Pinapayagan ng CORS ang frontend origin na tumawag sa API kasama ang credentials; `cookieParser` ang nagbabasa ng cookies; body parsers ang nagde-decode ng JSON at form requests.

**Edge case na puwedeng itanong:** Naka-hardcode sa localhost ang CORS origin at 50 MB ang body limit. Kailangang i-configure nang naaayon bago mag-deploy; hindi ito ibig sabihing production-ready na ang kasalukuyang CORS setting.

### 3. Route mounting

```js
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1/auth', socialAuth);
app.use('/api/auth', socialAuth);
app.use('/api/v1', order);
```

**Paliwanag:** Ikinakabit nito ang route groups sa API base paths. Ang authentication at role checks ay nasa kani-kanilang route definitions/middleware, hindi sa mounting lines na ito.

### 4. Centralized error middleware

```js
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    console.error(error);

    const isValidationError = error.name === 'ValidationError';
    const isBadObjectId = error.name === 'CastError';
    const isUploadLimitError = error.name === 'MulterError';
    const statusCode = error.statusCode ||
        (isValidationError || isBadObjectId ? 400 : isUploadLimitError ? 413 : 500);
    const message = statusCode >= 500 && statusCode !== 413
        ? 'An unexpected server error occurred'
        : error.message;
    return res.status(statusCode).json({ success: false, message });
});
```

**Paliwanag:** Dahil apat ang parameters, kinikilala ito ng Express bilang error middleware. Ipinapasa nito ang error sa susunod na handler kapag naipadala na ang response; kung hindi pa, nilolog ito, kinikilala ang validation/ObjectId/upload errors, at nagbabalik ng status code kasama ang JSON body. Para sa ordinaryong 5xx error, generic ang client message para hindi ilantad ang internal details.

**Sagot kay Sir:** *“Sir, `app.js` po ang nagse-set up ng middleware at nagmo-mount ng API routes. Nasa pinakadulo ang centralized error handler: nagma-map ito ng common input/upload errors sa tamang status at nagbabalik ng consistent JSON response.”*

## Mga tanong na magandang linawin habang nagde-demo

1. **“May payment method ba?”** — *“Wala po, dahil hindi ito requirement sa rubric. Ang transaction ay tina-track sa order status at walang payment processing sa app.”*
2. **“May exact review-count filter ba?”** — *“May filter po kung may reviews, pero wala pang minimum/exact numeric review-count filter.”*
3. **“Redux Toolkit ba ito?”** — *“Hindi po; Redux store/reducers at Redux Thunk ang implementation.”*
4. **“Production-ready na ba ang OAuth/email?”** — *“Nakadepende po ang aktuwal na login/email sa valid provider setup at environment configuration; hindi ko ipapakita o ilalagay sa documentation ang secret values.”*
5. **“Paano mapapatunayang gumagana ang core rules?”** — *“Patatakbuhin ko po ang backend tests, frontend lint, at production build; ipapakita rin ang workflow sa UI.”*

## Kaugnay na walkthrough

Para sa file-by-file na system directory at architecture explanation, tingnan ang [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md). Para sa requirement-by-requirement feature overview at demo order, tingnan ang root [`README.md`](./README.md).
