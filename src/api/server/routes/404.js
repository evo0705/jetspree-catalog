"use strict"

class RedirectInvalidRoute {
  constructor(router) {
    this.router = router
    this.registerRoutes()
  }

  registerRoutes() {
    this.router.get("*", this.redirectRoute.bind(this))
  }

  redirectRoute(req, res) {
    res.redirect(301, "https://www.jetspree.com/")
  }
}

module.exports = RedirectInvalidRoute
