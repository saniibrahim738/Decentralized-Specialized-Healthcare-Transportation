;; Driver Verification Contract
;; Validates qualifications for medical transport

(define-data-var last-driver-id uint u0)

;; Driver record structure
(define-map drivers
  { driver-id: uint }
  {
    name: (string-utf8 100),
    license: (string-utf8 50),
    medical-training: (string-utf8 200),
    vehicle-id: (string-utf8 50),
    contact: (string-utf8 50),
    certification-expiry: uint,
    background-check: bool,
    active: bool,
    rating: uint
  }
)

;; Register a new driver
(define-public (register-driver
                (name (string-utf8 100))
                (license (string-utf8 50))
                (medical-training (string-utf8 200))
                (vehicle-id (string-utf8 50))
                (contact (string-utf8 50))
                (certification-expiry uint)
                (background-check bool))
  (let ((new-id (+ (var-get last-driver-id) u1)))
    (var-set last-driver-id new-id)
    (map-set drivers
      { driver-id: new-id }
      {
        name: name,
        license: license,
        medical-training: medical-training,
        vehicle-id: vehicle-id,
        contact: contact,
        certification-expiry: certification-expiry,
        background-check: background-check,
        active: true,
        rating: u0
      }
    )
    (ok new-id)
  )
)

;; Update driver information
(define-public (update-driver
                (driver-id uint)
                (name (string-utf8 100))
                (license (string-utf8 50))
                (medical-training (string-utf8 200))
                (vehicle-id (string-utf8 50))
                (contact (string-utf8 50))
                (certification-expiry uint)
                (background-check bool))
  (let ((driver-data (map-get? drivers { driver-id: driver-id })))
    (if (is-some driver-data)
      (begin
        (map-set drivers
          { driver-id: driver-id }
          {
            name: name,
            license: license,
            medical-training: medical-training,
            vehicle-id: vehicle-id,
            contact: contact,
            certification-expiry: certification-expiry,
            background-check: background-check,
            active: (get active (unwrap-panic driver-data)),
            rating: (get rating (unwrap-panic driver-data))
          }
        )
        (ok true)
      )
      (err u1) ;; Driver not found
    )
  )
)

;; Deactivate driver
(define-public (deactivate-driver (driver-id uint))
  (let ((driver-data (map-get? drivers { driver-id: driver-id })))
    (if (is-some driver-data)
      (begin
        (map-set drivers
          { driver-id: driver-id }
          (merge (unwrap-panic driver-data) { active: false })
        )
        (ok true)
      )
      (err u1) ;; Driver not found
    )
  )
)

;; Reactivate driver
(define-public (reactivate-driver (driver-id uint))
  (let ((driver-data (map-get? drivers { driver-id: driver-id })))
    (if (is-some driver-data)
      (begin
        (map-set drivers
          { driver-id: driver-id }
          (merge (unwrap-panic driver-data) { active: true })
        )
        (ok true)
      )
      (err u1) ;; Driver not found
    )
  )
)

;; Rate a driver
(define-public (rate-driver (driver-id uint) (rating uint))
  (let ((driver-data (map-get? drivers { driver-id: driver-id })))
    (if (and (is-some driver-data) (<= rating u5))
      (begin
        (map-set drivers
          { driver-id: driver-id }
          (merge (unwrap-panic driver-data) { rating: rating })
        )
        (ok true)
      )
      (err u1) ;; Driver not found or invalid rating
    )
  )
)

;; Check if driver certification is valid
(define-read-only (is-certification-valid (driver-id uint))
  (let ((driver-data (map-get? drivers { driver-id: driver-id })))
    (if (is-some driver-data)
      (let ((expiry (get certification-expiry (unwrap-panic driver-data))))
        (< block-height expiry)
      )
      false
    )
  )
)

;; Get driver information
(define-read-only (get-driver (driver-id uint))
  (map-get? drivers { driver-id: driver-id })
)

