# 0052. Deploy smoke test, build label and release tag

Status: decided by the owner for implementation in Issue #80; teammate review pending

## Decision

1. The smoke test that runs after each deploy does not sign in. It checks `/api/health` (`status` is `ok`), `/api/ready` (`status` is `ready`) and that the page `/` contains the commit that was deployed. No account password is stored in GitHub for it.
2. The page shows `build <first 7 characters of the commit>` on the login page and in the top bar after sign-in. The value is passed into the image only in the deploy job; the CI build and the browser tests use the default `dev`.
3. The release of Lab 5 step 7 is tagged `v1.1` on `main`, after the deploy run is green and the Cloud Run revision uses the commit that was merged. `v1.0` stays where it is.

## Source

phittayanan answered these three questions in the session for Issue #66 on 2026-11-13, after two independent reviews of the design. The release Issue is #66; the code Issue is #80. Reasons: Issue #65 allows no password or secret in GitHub, and the commit in the page proves that the new image is the one that serves traffic.
