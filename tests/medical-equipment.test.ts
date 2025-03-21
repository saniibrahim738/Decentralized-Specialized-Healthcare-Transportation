import { describe, it, expect, beforeEach } from "vitest"
import { mockBlockchain } from "./helpers/mock-blockchain"

// Mock the blockchain environment
const blockchain = mockBlockchain()

describe("Medical Equipment Contract", () => {
  beforeEach(() => {
    // Reset blockchain state before each test
    blockchain.reset()
  })
  
  it("should register new equipment", async () => {
    const result = await blockchain.callContract("medical-equipment", "register-equipment", [
      "Wheelchair Lift",
      "Hydraulic lift for wheelchairs",
      true, // certification required
      10000, // maintenance interval (blocks)
    ])
    
    expect(result.success).toBe(true)
    expect(result.value).toBe(1) // First equipment ID should be 1
  })
  
  it("should retrieve equipment information", async () => {
    // First register equipment
    await blockchain.callContract("medical-equipment", "register-equipment", [
      "Wheelchair Lift",
      "Hydraulic lift for wheelchairs",
      true,
      10000,
    ])
    
    // Then retrieve the equipment info
    const result = await blockchain.callReadOnlyContract("medical-equipment", "get-equipment", [1])
    
    expect(result.success).toBe(true)
    expect(result.value.name).toBe("Wheelchair Lift")
    expect(result.value.active).toBe(true)
  })
  
  it("should update equipment information", async () => {
    // First register equipment
    await blockchain.callContract("medical-equipment", "register-equipment", [
      "Wheelchair Lift",
      "Hydraulic lift for wheelchairs",
      true,
      10000,
    ])
    
    // Then update the equipment info
    const updateResult = await blockchain.callContract("medical-equipment", "update-equipment", [
      1,
      "Wheelchair Lift v2",
      "Updated hydraulic lift for wheelchairs",
      true,
      15000,
    ])
    
    expect(updateResult.success).toBe(true)
    
    // Verify the update
    const getResult = await blockchain.callReadOnlyContract("medical-equipment", "get-equipment", [1])
    expect(getResult.value.name).toBe("Wheelchair Lift v2")
    expect(getResult.value.description).toBe("Updated hydraulic lift for wheelchairs")
    expect(getResult.value["maintenance-interval"]).toBe(15000)
  })
  
  it("should record equipment maintenance", async () => {
    // Register equipment
    await blockchain.callContract("medical-equipment", "register-equipment", [
      "Wheelchair Lift",
      "Hydraulic lift for wheelchairs",
      true,
      10000,
    ])
    
    // Set initial block height
    blockchain.setBlockHeight(5000)
    
    // Record maintenance
    const maintResult = await blockchain.callContract("medical-equipment", "record-maintenance", [1])
    expect(maintResult.success).toBe(true)
    
    // Verify maintenance record
    const getResult = await blockchain.callReadOnlyContract("medical-equipment", "get-equipment", [1])
    expect(getResult.value["last-maintenance"]).toBe(5000)
  })
  
  it("should assign equipment to vehicle", async () => {
    // Register equipment
    await blockchain.callContract("medical-equipment", "register-equipment", [
      "Wheelchair Lift",
      "Hydraulic lift for wheelchairs",
      true,
      10000,
    ])
    
    await blockchain.callContract("medical-equipment", "register-equipment", [
      "Oxygen Tank Holder",
      "Secure holder for oxygen tanks",
      false,
      5000,
    ])
    
    // Assign equipment to vehicle
    const assignResult = await blockchain.callContract("medical-equipment", "assign-equipment-to-vehicle", [
      "VEH-001",
      [1, 2],
    ])
    
    expect(assignResult.success).toBe(true)
    
    // Verify assignment
    const getResult = await blockchain.callReadOnlyContract("medical-equipment", "get-vehicle-equipment", ["VEH-001"])
    expect(getResult.success).toBe(true)
    expect(getResult.value["equipment-list"]).toEqual([1, 2])
  })
  
  it("should deactivate and reactivate equipment", async () => {
    // Register equipment
    await blockchain.callContract("medical-equipment", "register-equipment", [
      "Wheelchair Lift",
      "Hydraulic lift for wheelchairs",
      true,
      10000,
    ])
    
    // Deactivate equipment
    const deactivateResult = await blockchain.callContract("medical-equipment", "deactivate-equipment", [1])
    expect(deactivateResult.success).toBe(true)
    
    // Verify deactivation
    let getResult = await blockchain.callReadOnlyContract("medical-equipment", "get-equipment", [1])
    expect(getResult.value.active).toBe(false)
    
    // Reactivate equipment
    const reactivateResult = await blockchain.callContract("medical-equipment", "reactivate-equipment", [1])
    expect(reactivateResult.success).toBe(true)
    
    // Verify reactivation
    getResult = await blockchain.callReadOnlyContract("medical-equipment", "get-equipment", [1])
    expect(getResult.value.active).toBe(true)
  })
})

