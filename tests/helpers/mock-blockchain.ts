/**
 * Mock Blockchain Helper
 *
 * This file provides a simple mock implementation of a blockchain environment
 * for testing Clarity contracts without external dependencies.
 */

export function mockBlockchain() {
	let blockHeight = 0
	let state = {
		"patient-registration": {
			vars: {
				"last-patient-id": 0,
			},
			maps: {
				patients: {},
			},
		},
		"driver-verification": {
			vars: {
				"last-driver-id": 0,
			},
			maps: {
				drivers: {},
			},
		},
		"trip-coordination": {
			vars: {
				"last-trip-id": 0,
			},
			maps: {
				trips: {},
			},
		},
		"medical-equipment": {
			vars: {
				"last-equipment-id": 0,
			},
			maps: {
				equipment: {},
				"vehicle-equipment": {},
			},
		},
	}
	
	return {
		// Reset the blockchain state
		reset() {
			blockHeight = 0
			state = {
				"patient-registration": {
					vars: {
						"last-patient-id": 0,
					},
					maps: {
						patients: {},
					},
				},
				"driver-verification": {
					vars: {
						"last-driver-id": 0,
					},
					maps: {
						drivers: {},
					},
				},
				"trip-coordination": {
					vars: {
						"last-trip-id": 0,
					},
					maps: {
						trips: {},
					},
				},
				"medical-equipment": {
					vars: {
						"last-equipment-id": 0,
					},
					maps: {
						equipment: {},
						"vehicle-equipment": {},
					},
				},
			}
		},
		
		// Set the current block height
		setBlockHeight(height) {
			blockHeight = height
		},
		
		// Get the current block height
		getBlockHeight() {
			return blockHeight
		},
		
		// Call a contract function
		callContract(contract, method, args) {
			// This is a simplified mock implementation
			// In a real implementation, this would execute the actual contract code
			
			// For testing purposes, we'll implement basic functionality for each contract
			
			if (contract === "patient-registration") {
				return this.mockPatientRegistration(method, args)
			} else if (contract === "driver-verification") {
				return this.mockDriverVerification(method, args)
			} else if (contract === "trip-coordination") {
				return this.mockTripCoordination(method, args)
			} else if (contract === "medical-equipment") {
				return this.mockMedicalEquipment(method, args)
			}
			
			return { success: false, error: "Contract not found" }
		},
		
		// Call a read-only contract function
		callReadOnlyContract(contract, method, args) {
			return this.callContract(contract, method, args)
		},
		
		// Mock implementations for each contract
		
		mockPatientRegistration(method, args) {
			const contractState = state["patient-registration"]
			
			if (method === "register-patient") {
				const [name, address, contact, medicalCondition, mobilityReqs, specialNeeds, emergencyContact] = args
				const newId = contractState.vars["last-patient-id"] + 1
				contractState.vars["last-patient-id"] = newId
				
				contractState.maps.patients[newId] = {
					name,
					address,
					contact,
					"medical-condition": medicalCondition,
					"mobility-requirements": mobilityReqs,
					"special-needs": specialNeeds,
					"emergency-contact": emergencyContact,
					active: true,
				}
				
				return { success: true, value: newId }
			}
			
			if (method === "get-patient") {
				const [patientId] = args
				const patient = contractState.maps.patients[patientId]
				
				if (patient) {
					return { success: true, value: patient }
				}
				
				return { success: false, error: "Patient not found" }
			}
			
			if (method === "update-patient") {
				const [patientId, name, address, contact, medicalCondition, mobilityReqs, specialNeeds, emergencyContact] = args
				const patient = contractState.maps.patients[patientId]
				
				if (patient) {
					contractState.maps.patients[patientId] = {
						name,
						address,
						contact,
						"medical-condition": medicalCondition,
						"mobility-requirements": mobilityReqs,
						"special-needs": specialNeeds,
						"emergency-contact": emergencyContact,
						active: patient.active,
					}
					
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "deactivate-patient") {
				const [patientId] = args
				const patient = contractState.maps.patients[patientId]
				
				if (patient) {
					patient.active = false
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "reactivate-patient") {
				const [patientId] = args
				const patient = contractState.maps.patients[patientId]
				
				if (patient) {
					patient.active = true
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			return { success: false, error: "Method not found" }
		},
		
		mockDriverVerification(method, args) {
			const contractState = state["driver-verification"]
			
			if (method === "register-driver") {
				const [name, license, medicalTraining, vehicleId, contact, certExpiry, backgroundCheck] = args
				const newId = contractState.vars["last-driver-id"] + 1
				contractState.vars["last-driver-id"] = newId
				
				contractState.maps.drivers[newId] = {
					name,
					license,
					"medical-training": medicalTraining,
					"vehicle-id": vehicleId,
					contact,
					"certification-expiry": certExpiry,
					"background-check": backgroundCheck,
					active: true,
					rating: 0,
				}
				
				return { success: true, value: newId }
			}
			
			if (method === "get-driver") {
				const [driverId] = args
				const driver = contractState.maps.drivers[driverId]
				
				if (driver) {
					return { success: true, value: driver }
				}
				
				return { success: false, error: "Driver not found" }
			}
			
			if (method === "update-driver") {
				const [driverId, name, license, medicalTraining, vehicleId, contact, certExpiry, backgroundCheck] = args
				const driver = contractState.maps.drivers[driverId]
				
				if (driver) {
					contractState.maps.drivers[driverId] = {
						name,
						license,
						"medical-training": medicalTraining,
						"vehicle-id": vehicleId,
						contact,
						"certification-expiry": certExpiry,
						"background-check": backgroundCheck,
						active: driver.active,
						rating: driver.rating,
					}
					
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "is-certification-valid") {
				const [driverId] = args
				const driver = contractState.maps.drivers[driverId]
				
				if (driver) {
					return blockHeight < driver["certification-expiry"]
				}
				
				return false
			}
			
			if (method === "rate-driver") {
				const [driverId, rating] = args
				const driver = contractState.maps.drivers[driverId]
				
				if (driver && rating <= 5) {
					driver.rating = rating
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			return { success: false, error: "Method not found" }
		},
		
		mockTripCoordination(method, args) {
			const contractState = state["trip-coordination"]
			
			if (method === "schedule-trip") {
				const [patientId, driverId, pickupLocation, destination, scheduledTime, requiredEquipment, notes] = args
				const newId = contractState.vars["last-trip-id"] + 1
				contractState.vars["last-trip-id"] = newId
				
				contractState.maps.trips[newId] = {
					"patient-id": patientId,
					"driver-id": driverId,
					"pickup-location": pickupLocation,
					destination,
					"scheduled-time": scheduledTime,
					"required-equipment": requiredEquipment,
					status: 0, // STATUS-SCHEDULED
					notes,
					"actual-pickup-time": null,
					"actual-dropoff-time": null,
				}
				
				return { success: true, value: newId }
			}
			
			if (method === "get-trip") {
				const [tripId] = args
				const trip = contractState.maps.trips[tripId]
				
				if (trip) {
					return { success: true, value: trip }
				}
				
				return { success: false, error: "Trip not found" }
			}
			
			if (method === "start-trip") {
				const [tripId] = args
				const trip = contractState.maps.trips[tripId]
				
				if (trip && trip.status === 0) {
					trip.status = 1 // STATUS-IN-PROGRESS
					trip["actual-pickup-time"] = blockHeight
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "complete-trip") {
				const [tripId] = args
				const trip = contractState.maps.trips[tripId]
				
				if (trip && trip.status === 1) {
					trip.status = 2 // STATUS-COMPLETED
					trip["actual-dropoff-time"] = blockHeight
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "cancel-trip") {
				const [tripId] = args
				const trip = contractState.maps.trips[tripId]
				
				if (trip && trip.status === 0) {
					trip.status = 3 // STATUS-CANCELLED
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "update-trip") {
				const [tripId, pickupLocation, destination, scheduledTime, requiredEquipment, notes] = args
				const trip = contractState.maps.trips[tripId]
				
				if (trip && trip.status === 0) {
					trip["pickup-location"] = pickupLocation
					trip.destination = destination
					trip["scheduled-time"] = scheduledTime
					trip["required-equipment"] = requiredEquipment
					trip.notes = notes
					
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			return { success: false, error: "Method not found" }
		},
		
		mockMedicalEquipment(method, args) {
			const contractState = state["medical-equipment"]
			
			if (method === "register-equipment") {
				const [name, description, certificationRequired, maintenanceInterval] = args
				const newId = contractState.vars["last-equipment-id"] + 1
				contractState.vars["last-equipment-id"] = newId
				
				contractState.maps.equipment[newId] = {
					name,
					description,
					"certification-required": certificationRequired,
					"maintenance-interval": maintenanceInterval,
					"last-maintenance": blockHeight,
					active: true,
				}
				
				return { success: true, value: newId }
			}
			
			if (method === "get-equipment") {
				const [equipmentId] = args
				const equipment = contractState.maps.equipment[equipmentId]
				
				if (equipment) {
					return { success: true, value: equipment }
				}
				
				return { success: false, error: "Equipment not found" }
			}
			
			if (method === "update-equipment") {
				const [equipmentId, name, description, certificationRequired, maintenanceInterval] = args
				const equipment = contractState.maps.equipment[equipmentId]
				
				if (equipment) {
					equipment.name = name
					equipment.description = description
					equipment["certification-required"] = certificationRequired
					equipment["maintenance-interval"] = maintenanceInterval
					
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "record-maintenance") {
				const [equipmentId] = args
				const equipment = contractState.maps.equipment[equipmentId]
				
				if (equipment) {
					equipment["last-maintenance"] = blockHeight
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "is-maintenance-due") {
				const [equipmentId] = args
				const equipment = contractState.maps.equipment[equipmentId]
				
				if (equipment) {
					const lastMaint = equipment["last-maintenance"]
					const interval = equipment["maintenance-interval"]
					return blockHeight >= lastMaint + interval
				}
				
				return false
			}
			
			if (method === "assign-equipment-to-vehicle") {
				const [vehicleId, equipmentList] = args
				
				contractState.maps["vehicle-equipment"][vehicleId] = {
					"equipment-list": equipmentList,
				}
				
				return { success: true, value: true }
			}
			
			if (method === "get-vehicle-equipment") {
				const [vehicleId] = args
				const vehicleEquipment = contractState.maps["vehicle-equipment"][vehicleId]
				
				if (vehicleEquipment) {
					return { success: true, value: vehicleEquipment }
				}
				
				return { success: false, error: "Vehicle equipment not found" }
			}
			
			if (method === "deactivate-equipment") {
				const [equipmentId] = args
				const equipment = contractState.maps.equipment[equipmentId]
				
				if (equipment) {
					equipment.active = false
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			if (method === "reactivate-equipment") {
				const [equipmentId] = args
				const equipment = contractState.maps.equipment[equipmentId]
				
				if (equipment) {
					equipment.active = true
					return { success: true, value: true }
				}
				
				return { success: false, error: 1 }
			}
			
			return { success: false, error: "Method not found" }
		},
	}
}

