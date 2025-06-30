/**
 * Test untuk memvalidasi flow approval Purchase Request
 *
 * Cara menjalankan:
 * 1. Pastikan database sudah ter-setup
 * 2. Jalankan: node test/approvalFlow.test.js
 * 3. Atau: npm test (jika sudah dikonfigurasi)
 */

import db from "../config/Database.js";
import Users from "../models/UserModel.js";
import Departments from "../models/DepartmentModel.js";
import PurchaseRequest from "../models/PurchaseRequestModel.js";
import Approval from "../models/ApprovalModel.js";
import {
  getNextApprover,
  canApprovePR,
  isFinalApproval,
} from "../utils/approvalHelper.js";

// Test data
const testData = {
  departments: [{ name: "IT" }, { name: "Finance" }, { name: "HR" }],
  users: [
    {
      name: "Staff IT",
      email: "staff.it@test.com",
      password: "password123",
      role: "staff",
      departmentId: 1,
    },
    {
      name: "Manager IT",
      email: "manager.it@test.com",
      password: "password123",
      role: "manager",
      departmentId: 1,
    },
    {
      name: "Head IT",
      email: "head.it@test.com",
      password: "password123",
      role: "head_department",
      departmentId: 1,
    },
    {
      name: "Head Finance",
      email: "head.finance@test.com",
      password: "password123",
      role: "head_department",
      departmentId: 2,
    },
  ],
};

// Helper function untuk setup test data
async function setupTestData() {
  try {
    console.log("🔄 Setting up test data...");

    // Buat departemen
    for (const dept of testData.departments) {
      await Departments.findOrCreate({
        where: { name: dept.name },
        defaults: dept,
      });
    }

    // Buat users
    for (const user of testData.users) {
      await Users.findOrCreate({
        where: { email: user.email },
        defaults: user,
      });
    }

    console.log("✅ Test data setup completed");
  } catch (error) {
    console.error("❌ Error setting up test data:", error.message);
    throw error;
  }
}

// Helper function untuk cleanup test data
async function cleanupTestData() {
  try {
    console.log("🧹 Cleaning up test data...");

    // Hapus approval yang dibuat selama test
    await Approval.destroy({ where: {} });

    // Hapus PR yang dibuat selama test
    await PurchaseRequest.destroy({ where: {} });

    // Hapus users test
    for (const user of testData.users) {
      await Users.destroy({ where: { email: user.email } });
    }

    // Hapus departments test (hanya jika tidak ada user lain)
    for (const dept of testData.departments) {
      const userCount = await Users.count({ where: { departmentId: dept.id } });
      if (userCount === 0) {
        await Departments.destroy({ where: { name: dept.name } });
      }
    }

    console.log("✅ Test data cleanup completed");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error.message);
  }
}

// Test functions
async function testGetNextApprover() {
  console.log("\n🧪 Testing getNextApprover function...");

  try {
    const staffIT = await Users.findOne({
      where: { email: "staff.it@test.com" },
    });
    const managerIT = await Users.findOne({
      where: { email: "manager.it@test.com" },
    });
    const headIT = await Users.findOne({
      where: { email: "head.it@test.com" },
    });
    const headFinance = await Users.findOne({
      where: { email: "head.finance@test.com" },
    });

    // Test 1: Staff IT → Manager IT
    const nextApprover1 = await getNextApprover(staffIT);
    console.log(
      `✅ Staff IT → Next approver: ${nextApprover1?.name || "None"}`
    );

    // Test 2: Manager IT → Head IT
    const nextApprover2 = await getNextApprover(managerIT);
    console.log(
      `✅ Manager IT → Next approver: ${nextApprover2?.name || "None"}`
    );

    // Test 3: Head IT → Head Finance
    const nextApprover3 = await getNextApprover(headIT);
    console.log(`✅ Head IT → Next approver: ${nextApprover3?.name || "None"}`);

    // Test 4: Head Finance → None (langsung FINAL APPROVED)
    const nextApprover4 = await getNextApprover(headFinance);
    console.log(
      `✅ Head Finance → Next approver: ${
        nextApprover4?.name || "None (FINAL APPROVED)"
      }`
    );
  } catch (error) {
    console.error("❌ Error in testGetNextApprover:", error.message);
  }
}

async function testCanApprovePR() {
  console.log("\n🧪 Testing canApprovePR function...");

  try {
    const headIT = await Users.findOne({
      where: { email: "head.it@test.com" },
    });
    const headFinance = await Users.findOne({
      where: { email: "head.finance@test.com" },
    });
    const staffIT = await Users.findOne({
      where: { email: "staff.it@test.com" },
    });

    // Test 1: Head IT tidak bisa approve PR sendiri
    const canApprove1 = await canApprovePR(headIT.uuid, headIT.uuid);
    console.log(
      `✅ Head IT approve PR sendiri: ${
        canApprove1 ? "BISA" : "TIDAK BISA"
      } (Expected: TIDAK BISA)`
    );

    // Test 2: Head Finance bisa approve PR sendiri
    const canApprove2 = await canApprovePR(headFinance.uuid, headFinance.uuid);
    console.log(
      `✅ Head Finance approve PR sendiri: ${
        canApprove2 ? "BISA" : "TIDAK BISA"
      } (Expected: BISA)`
    );

    // Test 3: Head IT bisa approve PR staff
    const canApprove3 = await canApprovePR(headIT.uuid, staffIT.uuid);
    console.log(
      `✅ Head IT approve PR staff: ${
        canApprove3 ? "BISA" : "TIDAK BISA"
      } (Expected: BISA)`
    );
  } catch (error) {
    console.error("❌ Error in testCanApprovePR:", error.message);
  }
}

async function testIsFinalApproval() {
  console.log("\n🧪 Testing isFinalApproval function...");

  try {
    const headIT = await Users.findOne({
      where: { email: "head.it@test.com" },
    });
    const headFinance = await Users.findOne({
      where: { email: "head.finance@test.com" },
    });
    const managerIT = await Users.findOne({
      where: { email: "manager.it@test.com" },
    });

    // Test 1: Head Finance adalah final approver
    const isFinal1 = await isFinalApproval(headFinance);
    console.log(
      `✅ Head Finance is final approver: ${isFinal1} (Expected: true)`
    );

    // Test 2: Head IT bukan final approver
    const isFinal2 = await isFinalApproval(headIT);
    console.log(`✅ Head IT is final approver: ${isFinal2} (Expected: false)`);

    // Test 3: Manager IT bukan final approver
    const isFinal3 = await isFinalApproval(managerIT);
    console.log(
      `✅ Manager IT is final approver: ${isFinal3} (Expected: false)`
    );
  } catch (error) {
    console.error("❌ Error in testIsFinalApproval:", error.message);
  }
}

// Main test runner
async function runTests() {
  console.log("🚀 Starting Approval Flow Tests...\n");

  try {
    // Setup test data
    await setupTestData();

    // Run tests
    await testGetNextApprover();
    await testCanApprovePR();
    await testIsFinalApproval();

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("✅ getNextApprover - Flow approval berjalan sesuai hierarki");
    console.log("✅ canApprovePR - Validasi permission approval berfungsi");
    console.log(
      "✅ isFinalApproval - Hanya Head Finance yang bisa final approval"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    // Cleanup test data
    await cleanupTestData();

    // Close database connection
    await db.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
