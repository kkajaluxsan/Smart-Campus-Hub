# Postman Collection Run Evidence

## Collection Details
- **Collection Name:** Campus Hub API Tests
- **Collection UID:** 53508992-33f9c31b-22f2-4c58-bcd8-53f30a01a235
- **Run ID:** 53508992-f743addb-b9da-4615-9eda-b6a31767cbcb
- **Workspace:** Ketheeswaran Kajaluxsan's Workspace
- **Run State:** Failed

## Run Summary
- **Total Requests:** 4
- **Total Tests:** 7
- **Passed Tests:** 6
- **Failed Tests:** 1
- **Total Execution Time:** 679 ms

## Per-Request Outcomes

| Request Name | Method | URL | Response Status | Time (ms) | Tests Passed | Result |
|---|---|---|---|---:|---|---|
| Admin Login | POST | `http://localhost:8080/api/auth/login` | 200 OK | 410 | 2/2 | Passed |
| Get Admin Audit Logs | GET | `http://localhost:8080/api/admin/audit-logs` | 200 OK | 66 | 2/2 | Passed |
| User Login | POST | `http://localhost:8080/api/auth/login` | 200 OK | 159 | 2/2 | Passed |
| Get Admin Audit Logs As USER | POST | `http://localhost:8080/api/admin/audit-logs` | 500 Internal Server Error | 44 | 0/1 | Failed |

## Failure Detail
**Request:** Get Admin Audit Logs As USER  
**Configured Method:** POST  
**Endpoint:** `http://localhost:8080/api/admin/audit-logs`  
**Observed Response:** `500 Internal Server Error`

**Response Snippet:**
```json
{"timestamp":"2026-04-09T19:26:21.964514700Z","status":500,"message":"Request method 'POST' is not supported"}
```

**Assessment Note:**  
The single failed request was caused by a request method mismatch. The request was sent as **POST** to an endpoint that expects **GET**. Based on the available evidence, this result should be interpreted as a client-side request configuration issue in the collection run rather than a confirmed backend authorization or business-logic defect.

## Conclusion
This collection run provides evidence that **3 of 4 requests executed successfully** and **6 of 7 tests passed**. The only failure occurred because the request method used for **Get Admin Audit Logs As USER** did not match the endpoint's expected method (**POST** was used instead of **GET**). Therefore, the failed result does not on its own confirm a backend logic defect; it more directly indicates an incorrect request setup in the test execution.
