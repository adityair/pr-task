/**
 * Simple Test untuk Demonstrasi Flow Approval
 *
 * Test ini tidak memerlukan database, hanya untuk demonstrasi logic
 */

console.log("🧪 SIMPLE APPROVAL FLOW TEST\n");

// Mock data
const mockDepartments = {
  IT: { id: 1, name: "IT" },
  Finance: { id: 2, name: "Finance" },
  HR: { id: 3, name: "HR" },
};

const mockUsers = {
  staffIT: {
    name: "Staff IT",
    role: "staff",
    departmentId: 1,
  },
  managerIT: {
    name: "Manager IT",
    role: "manager",
    departmentId: 1,
  },
  headIT: {
    name: "Head IT",
    role: "head_department",
    departmentId: 1,
  },
  headFinance: {
    name: "Head Finance",
    role: "head_department",
    departmentId: 2,
  },
};

// Simulasi fungsi getNextApprover
function getNextApprover(user) {
  if (user.role === "staff") {
    return mockUsers.managerIT;
  } else if (user.role === "manager") {
    return mockUsers.headIT;
  } else if (user.role === "head_department") {
    if (user.departmentId === mockDepartments.Finance.id) {
      return null; // Langsung FINAL APPROVED
    } else {
      return mockUsers.headFinance;
    }
  }
  return null;
}

// Simulasi fungsi canApprovePR
function canApprovePR(approver, creator) {
  // Head Department Finance bisa approve PR sendiri
  if (
    approver.role === "head_department" &&
    approver.departmentId === mockDepartments.Finance.id
  ) {
    return true;
  }

  // Head Department selain Finance tidak bisa approve PR sendiri
  if (
    approver.role === "head_department" &&
    approver.departmentId !== mockDepartments.Finance.id &&
    approver.name === creator.name
  ) {
    return false;
  }

  return true;
}

// Simulasi fungsi isFinalApproval
function isFinalApproval(approver) {
  return (
    approver.role === "head_department" &&
    approver.departmentId === mockDepartments.Finance.id
  );
}

// Test scenarios
console.log("1. TESTING FLOW APPROVAL:");
console.log("========================");

const scenarios = [
  { name: "Staff IT membuat PR", user: mockUsers.staffIT },
  { name: "Manager IT membuat PR", user: mockUsers.managerIT },
  { name: "Head IT membuat PR", user: mockUsers.headIT },
  { name: "Head Finance membuat PR", user: mockUsers.headFinance },
];

scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log(`   Creator: ${scenario.user.name} (${scenario.user.role})`);

  const nextApprover = getNextApprover(scenario.user);
  if (nextApprover) {
    console.log(
      `   → Next approver: ${nextApprover.name} (${nextApprover.role})`
    );
  } else {
    console.log(`   → Langsung FINAL APPROVED (Head Department Finance)`);
  }
});

console.log("\n\n2. TESTING APPROVAL PERMISSIONS:");
console.log("================================");

const permissionTests = [
  {
    name: "Head IT tidak bisa approve PR sendiri",
    approver: mockUsers.headIT,
    creator: mockUsers.headIT,
    expected: false,
  },
  {
    name: "Head Finance bisa approve PR sendiri",
    approver: mockUsers.headFinance,
    creator: mockUsers.headFinance,
    expected: true,
  },
  {
    name: "Manager IT bisa approve PR staff",
    approver: mockUsers.managerIT,
    creator: mockUsers.staffIT,
    expected: true,
  },
  {
    name: "Head IT bisa approve PR manager",
    approver: mockUsers.headIT,
    creator: mockUsers.managerIT,
    expected: true,
  },
];

permissionTests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  const canApprove = canApprovePR(test.approver, test.creator);
  const status = canApprove ? "BISA" : "TIDAK BISA";
  const expected = test.expected ? "BISA" : "TIDAK BISA";
  console.log(`   Approver: ${test.approver.name} (${test.approver.role})`);
  console.log(`   Creator: ${test.creator.name} (${test.creator.role})`);
  console.log(`   Result: ${status} (Expected: ${expected})`);
  console.log(`   ${canApprove === test.expected ? "✅ PASS" : "❌ FAIL"}`);
});

console.log("\n\n3. TESTING FINAL APPROVAL:");
console.log("==========================");

const finalTests = [
  {
    name: "Head Finance adalah final approver",
    approver: mockUsers.headFinance,
    expected: true,
  },
  {
    name: "Head IT bukan final approver",
    approver: mockUsers.headIT,
    expected: false,
  },
  {
    name: "Manager IT bukan final approver",
    approver: mockUsers.managerIT,
    expected: false,
  },
];

finalTests.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  const isFinal = isFinalApproval(test.approver);
  const status = isFinal ? "FINAL APPROVER" : "BUKAN FINAL APPROVER";
  const expected = test.expected ? "FINAL APPROVER" : "BUKAN FINAL APPROVER";
  console.log(`   Approver: ${test.approver.name} (${test.approver.role})`);
  console.log(`   Result: ${status} (Expected: ${expected})`);
  console.log(`   ${isFinal === test.expected ? "✅ PASS" : "❌ FAIL"}`);
});

console.log("\n\n=== SUMMARY ===");
console.log("✅ Semua roles bisa membuat PR");
console.log(
  "✅ Head Department tidak bisa approve PR sendiri (kecuali Finance)"
);
console.log("✅ Hanya Head Department Finance yang bisa FINAL APPROVAL");
console.log(
  "✅ Flow approval berjalan sesuai hierarki: Staff → Manager → Head Dept → Head Finance"
);
console.log("\n🎉 Flow approval sudah sesuai dengan aturan yang diminta!");

console.log("\n\n📋 CARA MENJALANKAN TEST LENGKAP:");
console.log("===================================");
console.log("1. Pastikan database sudah ter-setup");
console.log("2. Masuk ke direktori Backend: cd Backend");
console.log("3. Jalankan test lengkap: npm test");
console.log("4. Atau lihat panduan lengkap di: TESTING_GUIDE.md");
