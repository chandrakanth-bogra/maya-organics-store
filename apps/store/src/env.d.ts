declare namespace App {
  interface Locals {
    /** The logged-in customer, or null (set in src/middleware.ts). */
    customer: import('@maya/db').Customer | null;
  }
}
