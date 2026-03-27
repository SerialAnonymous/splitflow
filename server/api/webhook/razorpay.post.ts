import { handleRazorpayWebhook } from '../../utils/handleRazorpayWebhook'

/** POST /api/webhook/razorpay — verified Razorpay webhooks (subscription + invoice). */
export default defineEventHandler((event) => handleRazorpayWebhook(event))
