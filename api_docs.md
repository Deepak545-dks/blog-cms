# BlogCMS: API Documentation

All endpoints are hosted relative to the base URL: `http://localhost:5000/api`.

---

## 1. Authentication (`/auth`)

### Register User
* **Method**: `POST`
* **Path**: `/register`
* **Body (Multipart/Form-Data)**:
  * `name` (String, Required)
  * `email` (String, Required)
  * `password` (String, Required)
  * `profileImage` (File, Optional)

### Login User
* **Method**: `POST`
* **Path**: `/login`
* **Body (JSON)**:
  * `email` (String, Required)
  * `password` (String, Required)

### Get Current User Profile
* **Method**: `GET`
* **Path**: `/profile`
* **Headers**: `Authorization: Bearer <token>`

---

## 2. Blog Management (`/blogs`)

### Get Blogs List (Paginated + Searched)
* **Method**: `GET`
* **Path**: `/`
* **Query Parameters**:
  * `page` (Number, default `1`)
  * `limit` (Number, default `6`)
  * `search` (String, query titles/contents)
  * `category` (String, filter by category name)
  * `sort` (String, values: `latest`, `oldest`)

### Get Blog by Slug (Public)
* **Method**: `GET`
* **Path**: `/slug/:slug`

### Create Blog
* **Method**: `POST`
* **Path**: `/`
* **Headers**: `Authorization: Bearer <token>`
* **Body (Multipart/Form-Data)**:
  * `title` (String, Required)
  * `excerpt` (String, Required)
  * `content` (HTML String, Required)
  * `category` (String, Required)
  * `status` (String, `'Draft'` or `'Published'`)
  * `tags` (String, comma separated)
  * `featuredImage` (File, Optional)

---

## 3. Page Builder (`/pages`)

### Create Page Canvas
* **Method**: `POST`
* **Path**: `/`
* **Headers**: `Authorization: Bearer <token>`
* **Body (JSON)**:
  * `title` (String, Required)
  * `slug` (String, Optional)

### Get User Pages
* **Method**: `GET`
* **Path**: `/`

### Update Page Layout Layout
* **Method**: `PUT`
* **Path**: `/:id`
* **Headers**: `Authorization: Bearer <token>`
* **Body (JSON)**:
  * `title` (String, Optional)
  * `slug` (String, Optional)
  * `layout` (Array of block JSONs, Optional)

---

## 4. Administrative Moderation (`/admin`)
*(All admin endpoints require user to have token and role === 'admin')*

### Get Overviews Stats
* **Method**: `GET`
* **Path**: `/stats`

### Get Chart Analytics data
* **Method**: `GET`
* **Path**: `/analytics`

### Get Users list
* **Method**: `GET`
* **Path**: `/users`

### Update User Role
* **Method**: `PUT`
* **Path**: `/users/:id`
* **Body**: `{ "role": "admin" }` or `{ "role": "user" }`

### Delete User
* **Method**: `DELETE`
* **Path**: `/users/:id`

### Moderate Comments
* **Method**: `GET`
* **Path**: `/comments`

### Delete Comments
* **Method**: `DELETE`
* **Path**: `/comments/:id`

---

## 5. Site Settings (`/settings`)

### Get Site branding
* **Method**: `GET`
* **Path**: `/` (Public)

### Update settings configs
* **Method**: `PUT`
* **Path**: `/`
* **Headers**: `Authorization: Bearer <token>` (Admin Only)
* **Body (Multipart/Form-Data)**:
  * `siteName` (String)
  * `contactEmail` (String)
  * `footerText` (String)
  * `siteLogo` (File, Optional)
  * `favicon` (File, Optional)
  * Social Links...
