"use strict"

import express from "express"

const apiRouter = express.Router()

import ProductsRoute from "./routes/products"
import ProductCategoriesRoute from "./routes/productCategories"
import SitemapRoute from "./routes/sitemap"
import ThemeRoute from "./routes/theme"
import CustomersRoute from "./routes/customers"
import CustomerGroupsRoute from "./routes/customerGroups"
import OrdersRoute from "./routes/orders"
import OrderStatusesRoute from "./routes/orderStatuses"
import ShippingMethodsRoute from "./routes/shippingMethods"
import PaymentMethodsRoute from "./routes/paymentMethods"
import PaymentGatewaysRoute from "./routes/paymentGateways"
import SettingsRoute from "./routes/settings"
import PagesRoute from "./routes/pages"
import SecurityTokensRoute from "./routes/tokens"
import NotificationsRoute from "./routes/notifications"
import RedirectsRoute from "./routes/redirects"
import FilesRoute from "./routes/files"
import AppsRoute from "./routes/apps"
import WebhooksRoute from "./routes/webhooks"
import BatchesRoute from "./routes/batches"

new ProductsRoute(apiRouter)
new ProductCategoriesRoute(apiRouter)
new SitemapRoute(apiRouter)
new ThemeRoute(apiRouter)
new CustomersRoute(apiRouter)
new CustomerGroupsRoute(apiRouter)
new OrdersRoute(apiRouter)
new OrderStatusesRoute(apiRouter)
new ShippingMethodsRoute(apiRouter)
new PaymentMethodsRoute(apiRouter)
new PaymentGatewaysRoute(apiRouter)
new SettingsRoute(apiRouter)
new PagesRoute(apiRouter)
new SecurityTokensRoute(apiRouter)
new NotificationsRoute(apiRouter)
new RedirectsRoute(apiRouter)
new FilesRoute(apiRouter)
new AppsRoute(apiRouter)
new WebhooksRoute(apiRouter)
new BatchesRoute(apiRouter)

module.exports = apiRouter
