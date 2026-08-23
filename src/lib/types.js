// No runtime types needed — this file documents the data shapes used throughout the app.
// All validation is done at the data layer.

/**
 * @typedef {'customer' | 'worker' | 'admin'} UserRole
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {UserRole} role
 * @property {string} [avatar_url]
 *
 * @typedef {'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'} RequestStatus
 *
 * @typedef {Object} Property
 * @property {string} id
 * @property {string} customer_id
 * @property {string} name
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} tree_count
 *
 * @typedef {Object} ServiceRequest
 * @property {string} id
 * @property {string} customer_id
 * @property {string} property_id
 * @property {number} tree_count
 * @property {string} preferred_date
 * @property {string} preferred_time
 * @property {RequestStatus} status
 * @property {number} estimated_price
 * @property {number} [final_price]
 * @property {string} [worker_id]
 * @property {string} [notes]
 * @property {string} created_at
 *
 * @typedef {ServiceRequest & { property?: Property, worker?: User, customer?: User }} ServiceRequestWithDetails
 *
 * @typedef {'assigned' | 'en_route' | 'in_progress' | 'completed'} JobStatus
 *
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} request_id
 * @property {string} worker_id
 * @property {JobStatus} status
 * @property {string} [started_at]
 * @property {string} [completed_at]
 * @property {string[]} [completion_photos]
 * @property {number} [rating]
 * @property {string} [review]
 *
 * @typedef {Job & { request: ServiceRequestWithDetails }} JobWithDetails
 */

export {};
