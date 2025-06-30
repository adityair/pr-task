const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test data
const testUsers = {
  staff: { email: "staff@test.com", password: "password123" },
  manager: { email: "manager@test.com", password: "password123" },
  headDept: { email: "headdept@test.com", password: "password123" },
  headFinance: { email: "headfinance@test.com", password: "password123" },
};

let tokens = {};
let testPRId = null;

// Helper function untuk login
async function loginUser(userData) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, userData);
    return response.data.accessToken;
  } catch (error) {
    console.error("Login failed:", error.response?.data);
    return null;
  }
}

// Helper function untuk membuat PR
async function createPR(token) {
  try {
    const prData = {
      name: "Test PR for History",
      description: "Test PR untuk testing riwayat approval",
      items: [
        {
          item_name: "Test Item 1",
          quantity: 5,
          unit: "pcs",
          price_per_unit: 100000,
          note: "Test item untuk approval history",
        },
      ],
    };

    const response = await axios.post(`${BASE_URL}/purchase-request`, prData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.id;
  } catch (error) {
    console.error("Create PR failed:", error.response?.data);
    return null;
  }
}

// Helper function untuk submit PR
async function submitPR(prId, token) {
  try {
    await axios.post(
      `${BASE_URL}/purchase-request/submit`,
      { id: prId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return true;
  } catch (error) {
    console.error("Submit PR failed:", error.response?.data);
    return false;
  }
}

// Helper function untuk approve PR
async function approvePR(prId, token, comment = "Test approval") {
  try {
    await axios.post(
      `${BASE_URL}/approvals/approve/${prId}`,
      { comment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return true;
  } catch (error) {
    console.error("Approve PR failed:", error.response?.data);
    return false;
  }
}

// Helper function untuk reject PR
async function rejectPR(prId, token, comment = "Test rejection") {
  try {
    await axios.post(
      `${BASE_URL}/approvals/reject/${prId}`,
      { comment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return true;
  } catch (error) {
    console.error("Reject PR failed:", error.response?.data);
    return false;
  }
}

// Test cases
async function testApprovalHistory() {
  console.log("🧪 Testing Approval History Feature...\n");

  // 1. Login semua user
  console.log("1. Login semua user...");
  for (const [role, userData] of Object.entries(testUsers)) {
    tokens[role] = await loginUser(userData);
    if (tokens[role]) {
      console.log(`   ✅ ${role} logged in successfully`);
    } else {
      console.log(`   ❌ ${role} login failed`);
      return;
    }
  }

  // 2. Staff membuat PR
  console.log("\n2. Staff membuat PR...");
  testPRId = await createPR(tokens.staff);
  if (testPRId) {
    console.log(`   ✅ PR created with ID: ${testPRId}`);
  } else {
    console.log("   ❌ Failed to create PR");
    return;
  }

  // 3. Staff submit PR
  console.log("\n3. Staff submit PR...");
  const submitSuccess = await submitPR(testPRId, tokens.staff);
  if (submitSuccess) {
    console.log("   ✅ PR submitted successfully");
  } else {
    console.log("   ❌ Failed to submit PR");
    return;
  }

  // 4. Manager approve PR
  console.log("\n4. Manager approve PR...");
  const managerApproveSuccess = await approvePR(
    testPRId,
    tokens.manager,
    "Disetujui oleh manager"
  );
  if (managerApproveSuccess) {
    console.log("   ✅ Manager approved PR");
  } else {
    console.log("   ❌ Manager approval failed");
    return;
  }

  // 5. Head Department approve PR
  console.log("\n5. Head Department approve PR...");
  const headDeptApproveSuccess = await approvePR(
    testPRId,
    tokens.headDept,
    "Disetujui oleh head department"
  );
  if (headDeptApproveSuccess) {
    console.log("   ✅ Head Department approved PR");
  } else {
    console.log("   ❌ Head Department approval failed");
    return;
  }

  // 6. Head Finance approve PR (final)
  console.log("\n6. Head Finance approve PR (final)...");
  const headFinanceApproveSuccess = await approvePR(
    testPRId,
    tokens.headFinance,
    "Final approval oleh head finance"
  );
  if (headFinanceApproveSuccess) {
    console.log("   ✅ Head Finance approved PR (FINAL)");
  } else {
    console.log("   ❌ Head Finance approval failed");
    return;
  }

  // 7. Test get approval history
  console.log("\n7. Test get approval history...");
  try {
    const historyResponse = await axios.get(
      `${BASE_URL}/approvals/history/${testPRId}`,
      {
        headers: { Authorization: `Bearer ${tokens.staff}` },
      }
    );

    const history = historyResponse.data;
    console.log(`   ✅ Approval history retrieved: ${history.length} records`);

    // Display history details
    console.log("\n   📋 Approval History Details:");
    history.forEach((approval, index) => {
      console.log(`   ${index + 1}. Status: ${approval.status}`);
      console.log(`      Approver: ${approval.approver?.name || "N/A"}`);
      console.log(`      Role: ${approval.approver?.role || "N/A"}`);
      console.log(`      Time: ${approval.approvedAt || "N/A"}`);
      console.log(`      Comment: ${approval.comment || "N/A"}`);
      console.log("");
    });

    // Validate history
    if (history.length >= 3) {
      console.log("   ✅ History contains at least 3 approval records");
    } else {
      console.log("   ❌ History should contain at least 3 approval records");
    }

    // Check if all approvals have approvedAt timestamp
    const allHaveTimestamp = history.every((approval) => approval.approvedAt);
    if (allHaveTimestamp) {
      console.log("   ✅ All approvals have timestamp");
    } else {
      console.log("   ❌ Some approvals missing timestamp");
    }
  } catch (error) {
    console.log("   ❌ Failed to get approval history:", error.response?.data);
  }

  // 8. Test approval history with different user
  console.log("\n8. Test approval history with different user...");
  try {
    const historyResponse2 = await axios.get(
      `${BASE_URL}/approvals/history/${testPRId}`,
      {
        headers: { Authorization: `Bearer ${tokens.manager}` },
      }
    );

    console.log(
      `   ✅ Manager can access approval history: ${historyResponse2.data.length} records`
    );
  } catch (error) {
    console.log(
      "   ❌ Manager cannot access approval history:",
      error.response?.data
    );
  }

  console.log("\n🎉 Approval History Test Completed!");
}

// Test error cases
async function testApprovalHistoryErrors() {
  console.log("\n🧪 Testing Approval History Error Cases...\n");

  // 1. Test with invalid PR ID
  console.log("1. Test with invalid PR ID...");
  try {
    await axios.get(`${BASE_URL}/approvals/history/99999`, {
      headers: { Authorization: `Bearer ${tokens.staff}` },
    });
    console.log("   ❌ Should have failed with invalid PR ID");
  } catch (error) {
    if (error.response?.status === 404) {
      console.log("   ✅ Correctly failed with invalid PR ID");
    } else {
      console.log("   ❌ Unexpected error:", error.response?.data);
    }
  }

  // 2. Test without authentication
  console.log("\n2. Test without authentication...");
  try {
    await axios.get(`${BASE_URL}/approvals/history/${testPRId}`);
    console.log("   ❌ Should have failed without authentication");
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("   ✅ Correctly failed without authentication");
    } else {
      console.log("   ❌ Unexpected error:", error.response?.data);
    }
  }

  // 3. Test with invalid token
  console.log("\n3. Test with invalid token...");
  try {
    await axios.get(`${BASE_URL}/approvals/history/${testPRId}`, {
      headers: { Authorization: "Bearer invalid_token" },
    });
    console.log("   ❌ Should have failed with invalid token");
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("   ✅ Correctly failed with invalid token");
    } else {
      console.log("   ❌ Unexpected error:", error.response?.data);
    }
  }

  console.log("\n🎉 Error Cases Test Completed!");
}

// Run tests
async function runTests() {
  try {
    await testApprovalHistory();
    await testApprovalHistoryErrors();
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

// Export for manual testing
module.exports = {
  testApprovalHistory,
  testApprovalHistoryErrors,
  runTests,
};

// Run if called directly
if (require.main === module) {
  runTests();
}
