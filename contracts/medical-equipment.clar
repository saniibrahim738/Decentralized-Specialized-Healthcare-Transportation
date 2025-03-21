;; Medical Equipment Contract
;; Tracks specialized equipment on vehicles

(define-data-var last-equipment-id uint u0)

;; Equipment record structure
(define-map equipment
  { equipment-id: uint }
  {
    name: (string-utf8 100),
    description: (string-utf8 200),
    certification-required: bool,
    maintenance-interval: uint,
    last-maintenance: uint,
    active: bool
  }
)

;; Vehicle equipment mapping
(define-map vehicle-equipment
  { vehicle-id: (string-utf8 50) }
  { equipment-list: (list 20 uint) }
)

;; Register new equipment
(define-public (register-equipment
                (name (string-utf8 100))
                (description (string-utf8 200))
                (certification-required bool)
                (maintenance-interval uint))
  (let ((new-id (+ (var-get last-equipment-id) u1)))
    (var-set last-equipment-id new-id)
    (map-set equipment
      { equipment-id: new-id }
      {
        name: name,
        description: description,
        certification-required: certification-required,
        maintenance-interval: maintenance-interval,
        last-maintenance: block-height,
        active: true
      }
    )
    (ok new-id)
  )
)

;; Update equipment information
(define-public (update-equipment
                (equipment-id uint)
                (name (string-utf8 100))
                (description (string-utf8 200))
                (certification-required bool)
                (maintenance-interval uint))
  (let ((equipment-data (map-get? equipment { equipment-id: equipment-id })))
    (if (is-some equipment-data)
      (begin
        (map-set equipment
          { equipment-id: equipment-id }
          {
            name: name,
            description: description,
            certification-required: certification-required,
            maintenance-interval: maintenance-interval,
            last-maintenance: (get last-maintenance (unwrap-panic equipment-data)),
            active: (get active (unwrap-panic equipment-data))
          }
        )
        (ok true)
      )
      (err u1) ;; Equipment not found
    )
  )
)

;; Record equipment maintenance
(define-public (record-maintenance (equipment-id uint))
  (let ((equipment-data (map-get? equipment { equipment-id: equipment-id })))
    (if (is-some equipment-data)
      (begin
        (map-set equipment
          { equipment-id: equipment-id }
          (merge (unwrap-panic equipment-data) { last-maintenance: block-height })
        )
        (ok true)
      )
      (err u1) ;; Equipment not found
    )
  )
)

;; Deactivate equipment
(define-public (deactivate-equipment (equipment-id uint))
  (let ((equipment-data (map-get? equipment { equipment-id: equipment-id })))
    (if (is-some equipment-data)
      (begin
        (map-set equipment
          { equipment-id: equipment-id }
          (merge (unwrap-panic equipment-data) { active: false })
        )
        (ok true)
      )
      (err u1) ;; Equipment not found
    )
  )
)

;; Reactivate equipment
(define-public (reactivate-equipment (equipment-id uint))
  (let ((equipment-data (map-get? equipment { equipment-id: equipment-id })))
    (if (is-some equipment-data)
      (begin
        (map-set equipment
          { equipment-id: equipment-id }
          (merge (unwrap-panic equipment-data) { active: true })
        )
        (ok true)
      )
      (err u1) ;; Equipment not found
    )
  )
)

;; Assign equipment to vehicle
(define-public (assign-equipment-to-vehicle
                (vehicle-id (string-utf8 50))
                (equipment-list (list 20 uint)))
  (begin
    (map-set vehicle-equipment
      { vehicle-id: vehicle-id }
      { equipment-list: equipment-list }
    )
    (ok true)
  )
)

;; Check if maintenance is due
(define-read-only (is-maintenance-due (equipment-id uint))
  (let ((equipment-data (map-get? equipment { equipment-id: equipment-id })))
    (if (is-some equipment-data)
      (let (
        (last-maint (get last-maintenance (unwrap-panic equipment-data)))
        (interval (get maintenance-interval (unwrap-panic equipment-data)))
      )
        (>= block-height (+ last-maint interval))
      )
      false
    )
  )
)

;; Get equipment information
(define-read-only (get-equipment (equipment-id uint))
  (map-get? equipment { equipment-id: equipment-id })
)

;; Get vehicle equipment
(define-read-only (get-vehicle-equipment (vehicle-id (string-utf8 50)))
  (map-get? vehicle-equipment { vehicle-id: vehicle-id })
)

