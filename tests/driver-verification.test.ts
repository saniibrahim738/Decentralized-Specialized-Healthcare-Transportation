import { describe, it, expect, beforeEach } from "vitest"
import { mockBlockchain } from "./helpers/mock-blockchain"

// Mock the blockchain environment
const blockchain = mockBlockchain()

describe("Driver Verification Contract", () => {
  beforeEach(() => {
    // Reset blockchain state before each test
    blockchain.reset()
  })
  
  it("should register a new driver", async () => {
    const result = await blockchain.callContract("driver-verification", "register-driver", [
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Basic Life Support",
      "VEH-001",
      "555-789-0123",
      1000000, // certification expiry (block height)
      true, // background check passed
    ])
    
    expect(result.success).toBe(true)
    expect(result.value).toBe(1) // First driver ID should be 1
  })
  
  it("should retrieve driver information", async () => {
    // First register a driver
    await blockchain.callContract("driver-verification", "register-driver", [
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Basic Life Support",
      "VEH-001",
      "555-789-0123",
      1000000, // certification expiry (block height)
      true, // background check passed
    ])
    
    // Then retrieve the driver info
    const result = await blockchain.callReadOnlyContract("driver-verification", "get-driver", [1])
    
    expect(result.success).toBe(true)
    expect(result.value.name).toBe("Alice Smith")
    expect(result.value.active).toBe(true)
  })
  
  it("should update driver information", async () => {
    // First register a driver
    await blockchain.callContract("driver-verification", "register-driver", [
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Basic Life Support",
      "VEH-001",
      "555-789-0123",
      1000000,
      true,
    ])
    
    // Then update the driver info
    const updateResult = await blockchain.callContract("driver-verification", "update-driver", [
      1,
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Advanced Life Support",
      "VEH-002",
      "555-789-0123",
      1500000,
      true,
    ])
    
    expect(updateResult.success).toBe(true)
    
    // Verify the update
    const getResult = await blockchain.callReadOnlyContract("driver-verification", "get-driver", [1])
    expect(getResult.value["medical-training"]).toBe("CPR Certified, Advanced Life Support")
    expect(getResult.value["vehicle-id"]).toBe("VEH-002")
  })
  
  it("should check certification validity", async () => {
    // Register a driver with certification expiry in the future
    await blockchain.callContract("driver-verification", "register-driver", [
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Basic Life Support",
      "VEH-001",
      "555-789-0123",
      1000000, // future block height
      true,
    ])
    
    // Set current block height to 500000
    blockchain.setBlockHeight(500000)
    
    // Check if certification is valid
    const validResult = await blockchain.callReadOnlyContract("driver-verification", "is-certification-valid", [1])
    expect(validResult).toBe(true)
    
    // Set current block height to 1500000 (after expiry)
    blockchain.setBlockHeight(1500000)
    
    // Check if certification is now invalid
    const invalidResult = await blockchain.callReadOnlyContract("driver-verification", "is-certification-valid", [1])
    expect(invalidResult).toBe(false)
  })
  
  it("should rate a driver", async () => {
    // First register a driver
    await blockchain.callContract("driver-verification", "register-driver", [
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Basic Life Support",
      "VEH-001",
      "555-789-0123",
      1000000,
      true,
    ])
    
    // Then rate the driver
    const rateResult = await blockchain.callContract("driver-verification", "rate-driver", [1, 5])
    expect(rateResult.success).toBe(true)
    
    // Verify the rating
    const getResult = await blockchain.callReadOnlyContract("driver-verification", "get-driver", [1])
    expect(getResult.value.rating).toBe(5)
  })
  
  it("should fail to rate a driver with invalid rating", async () => {
    // First register a driver
    await blockchain.callContract("driver-verification", "register-driver", [
      "Alice Smith",
      "DL12345678",
      "CPR Certified, Basic Life Support",
      "VEH-001",
      "555-789-0123",
      1000000,
      true,
    ])
    
    // Try to rate the driver with an invalid rating
    const rateResult = await blockchain.callContract("driver-verification", "rate-driver", [1, 6]) // Rating > 5
    expect(rateResult.success).toBe(false)
  })
})

