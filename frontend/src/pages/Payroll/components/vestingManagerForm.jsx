import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Info,
  CheckCircle,
  Loader2,
  BarChart3,
  Settings,
  FileText,
  HelpCircle,
  Contact,
  X,
  Plus,
  Trash2,
  Upload,
  BarChart2,
  Clock,
  Percent,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useTokenLock } from "@/hooks/useTokenLock";
import { useTokenInfo } from "@/hooks/useTokenInfo";
import { useAccount } from "wagmi";
import ContactSelector from "@/components/ContactSelector";

// Enums for the unified vesting form
const UnlockSchedule = {
  SECOND: 0,
  MINUTE: 1,
  HOUR: 2,
  DAILY: 3,
  WEEKLY: 4,
  BIWEEKLY: 5,
  MONTHLY: 6,
  QUARTERLY: 7,
  YEARLY: 8,
};

const CancelPermission = {
  NONE: 0,
  SENDER_ONLY: 1,
  RECIPIENT_ONLY: 2,
  BOTH: 3,
};

const ChangeRecipientPermission = {
  NONE: 0,
  SENDER_ONLY: 1,
  RECIPIENT_ONLY: 2,
  BOTH: 3,
};

export default function VestingManagerForm() {
  const { address } = useAccount();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState("unified"); // 'unified', 'multivesting'

  // Token selection state
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenSelection, setTokenSelection] = useState("custom");
  const [predefinedTokens] = useState({
    usdt: {
      address: "0xC9592d8D3AA150d62E9638C5588264abFc5D9976",
      name: "Tether USD",
      symbol: "USDT",
    },
    usdc: {
      address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
      name: "USD Coin",
      symbol: "USDC",
    },
  });

  // Unified vesting state
  const [recipients, setRecipients] = useState([
    { address: "", amount: "", title: "", email: "", error: "" },
  ]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [unlockSchedule, setUnlockSchedule] = useState(1); // Daily
  const [autoClaim, setAutoClaim] = useState(false);
  const [cancelPermission, setCancelPermission] = useState(3); // Both
  const [changeRecipientPermission, setChangeRecipientPermission] = useState(3); // Both
  const [csvInput, setCsvInput] = useState("");
  const [showCsvInput, setShowCsvInput] = useState(false);

  // Validation states
  const [errors, setErrors] = useState({});
  const [showTooltip, setShowTooltip] = useState("");

  // Multiple Vesting specific state
  const [multipleRecipients, setMultipleRecipients] = useState([
    { address: "", amount: "", email: "", error: "" },
  ]);
  const [multipleRecipientsError, setMultipleRecipientsError] = useState("");
  const [multipleCsvInput, setMultipleCsvInput] = useState("");
  const [showMultipleCsvInput, setShowMultipleCsvInput] = useState(false);
  const [openPickerIndex, setOpenPickerIndex] = useState(null);

  // Vesting specific state
  const [tgeDate, setTgeDate] = useState("");
  const [tgeBps, setTgeBps] = useState("2000"); // Default 20%
  const [cycle, setCycle] = useState("86400"); // Default 1 day
  const [cycleBps, setCycleBps] = useState("1000"); // Default 10%
  const [tgeDateError, setTgeDateError] = useState("");
  const [tgeBpsError, setTgeBpsError] = useState("");
  const [cycleError, setCycleError] = useState("");
  const [cycleBpsError, setCycleBpsError] = useState("");
  const [vestingDetails, setVestingDetails] = useState(null);

  // Hook instances
  const tokenLock = useTokenLock();
  const { tokenInfo, isLoadingToken, tokenError, fetchTokenInfo } =
    useTokenInfo(tokenAddress, address);

  // Set minimum dates
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5); // 5 minutes from now
  const minDateTime = now.toISOString().slice(0, 16);

  // Fetch token info when address changes
  useEffect(() => {
    if (tokenAddress && tokenAddress.length === 42) {
      fetchTokenInfo();
    }
  }, [tokenAddress, fetchTokenInfo]);

  const handleTokenAddressChange = (e) => {
    const value = e.target.value;
    setTokenAddress(value);

    if (tokenSelection !== "custom") {
      setTokenSelection("custom");
    }

    // Validate address
    if (value && !value.startsWith("0x")) {
      setErrors((prev) => ({
        ...prev,
        tokenAddress: "Address must start with 0x",
      }));
    } else if (value && value.length !== 42) {
      setErrors((prev) => ({
        ...prev,
        tokenAddress: "Address must be 42 characters long",
      }));
    } else {
      setErrors((prev) => ({ ...prev, tokenAddress: "" }));
    }
  };

  const validateVestingSchedule = () => {
    const newErrors = {};

    if (!tokenAddress) newErrors.tokenAddress = "Token address is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";

    if (startTime && new Date(startTime).getTime() <= Date.now()) {
      newErrors.startTime = "Start time must be in the future";
    }

    if (
      startTime &&
      endTime &&
      new Date(endTime).getTime() <= new Date(startTime).getTime()
    ) {
      newErrors.endTime = "End time must be after start time";
    }

    // Validate recipients
    const validRecipients = recipients.filter(
      (r) => r.address && r.amount && !r.error
    );
    if (validRecipients.length === 0) {
      newErrors.recipients = "At least one valid recipient is required";
    }

    // Validate each recipient
    recipients.forEach((recipient, index) => {
      if (
        recipient.address &&
        (!recipient.address.startsWith("0x") || recipient.address.length !== 42)
      ) {
        newErrors[`recipient_${index}`] = "Invalid recipient address";
      }
      if (
        recipient.amount &&
        (isNaN(Number(recipient.amount)) || Number(recipient.amount) <= 0)
      ) {
        newErrors[`recipient_${index}`] = "Invalid amount";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateVestingSchedule = async () => {
    if (!validateVestingSchedule()) return;

    const validRecipients = recipients.filter(
      (r) => r.address && r.amount && !r.error
    );

    try {
      if (validRecipients.length === 1) {
        // Single recipient - use single vesting function
        const recipient = validRecipients[0];
        // For single recipient, we can use simple vesting lock
        const result = await tokenLock.performTokenLock(
          tokenAddress,
          tokenInfo.decimals,
          recipient.amount,
          endTime,
          recipient.title || "Vesting Schedule"
        );

        if (result.success) {
          // Reset form
          setRecipients([
            { address: "", amount: "", title: "", email: "", error: "" },
          ]);
          setStartTime("");
          setEndTime("");
          // Navigate to vesting schedules page
          navigate("/vesting-schedules");
        }
      } else {
        // Multiple recipients - use multiple vesting function
        const addresses = validRecipients.map((r) => r.address);
        const amounts = validRecipients.map((r) => r.amount);

        // For multiple recipients, use multiple vesting lock
        const hash = await tokenLock.multipleVestingLock(
          addresses,
          amounts,
          tokenAddress,
          tokenInfo.decimals,
          startTime,
          "2000", // 20% TGE
          "86400", // 1 day cycle
          "1000", // 10% per cycle
          "Multiple Vesting Schedules"
        );

        if (hash) {
          // Reset form
          setRecipients([
            { address: "", amount: "", title: "", email: "", error: "" },
          ]);
          setStartTime("");
          setEndTime("");
          // Navigate to vesting schedules page
          navigate("/vesting-schedules");
        }
      }
    } catch (error) {
      console.error("Error creating vesting schedule:", error);
    }
  };

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      { address: "", amount: "", title: "", email: "", error: "" },
    ]);
  };

  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;

    // Validate
    if (field === "address") {
      if (value && (!value.startsWith("0x") || value.length !== 42)) {
        newRecipients[index].error = "Invalid address format";
      } else {
        newRecipients[index].error = "";
      }
    } else if (field === "amount") {
      if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
        newRecipients[index].error = "Invalid amount";
      } else {
        newRecipients[index].error = "";
      }
    }

    setRecipients(newRecipients);
  };

  const parseCsvInput = () => {
    try {
      const lines = csvInput.trim().split("\n");
      const newRecipients = lines
        .map((line) => {
          const [address, amount, title = "", email = ""] = line
            .split(",")
            .map((s) => s.trim());
          return {
            address: address || "",
            amount: amount || "",
            title,
            email,
            error: "",
          };
        })
        .filter((r) => r.address || r.amount);

      if (newRecipients.length > 0) {
        setRecipients(newRecipients);
        setCsvInput("");
        setShowCsvInput(false);
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
    }
  };

  // Multiple Vesting handlers
  const addMultipleRecipient = () => {
    setMultipleRecipients([
      ...multipleRecipients,
      { address: "", amount: "", email: "", error: "" },
    ]);
  };

  const removeMultipleRecipient = (index) => {
    if (multipleRecipients.length > 1) {
      const newRecipients = multipleRecipients.filter((_, i) => i !== index);
      setMultipleRecipients(newRecipients);
      validateMultipleRecipients(newRecipients);
    }
  };

  const updateMultipleRecipient = (index, field, value) => {
    const newRecipients = [...multipleRecipients];
    newRecipients[index][field] = value;

    // Validate the specific recipient
    if (field === "address") {
      if (value && !value.startsWith("0x")) {
        newRecipients[index].error = "Address must start with 0x";
      } else if (value && value.length !== 42) {
        newRecipients[index].error = "Address must be 42 characters long";
      } else {
        newRecipients[index].error = "";
      }
    } else if (field === "amount") {
      if (value && isNaN(Number(value.replace(/,/g, "")))) {
        newRecipients[index].error = "Please enter a valid number";
      } else if (value && Number(value.replace(/,/g, "")) <= 0) {
        newRecipients[index].error = "Amount must be greater than 0";
      } else {
        newRecipients[index].error = "";
      }
    }

    setMultipleRecipients(newRecipients);
    validateMultipleRecipients(newRecipients);
  };

  const validateMultipleRecipients = (recipientsList = multipleRecipients) => {
    const addresses = recipientsList
      .map((r) => r.address.toLowerCase())
      .filter((a) => a);
    const duplicates = addresses.filter(
      (addr, index) => addresses.indexOf(addr) !== index
    );

    if (duplicates.length > 0) {
      setMultipleRecipientsError("Duplicate addresses found");
      return false;
    }

    const hasErrors = recipientsList.some(
      (r) => r.error || !r.address || !r.amount
    );
    if (hasErrors) {
      setMultipleRecipientsError("Please fix all recipient errors");
      return false;
    }

    setMultipleRecipientsError("");
    return true;
  };

  const parseMultipleCsvInput = () => {
    try {
      const lines = multipleCsvInput.trim().split("\n");
      const newRecipients = lines
        .map((line) => {
          const [address, amount, email = ""] = line
            .split(",")
            .map((s) => s.trim());
          return {
            address: address || "",
            amount: amount || "",
            email: email || "",
            error: "",
          };
        })
        .filter((r) => r.address || r.amount);

      if (newRecipients.length > 0) {
        setMultipleRecipients(newRecipients);
        setMultipleCsvInput("");
        setShowMultipleCsvInput(false);
        validateMultipleRecipients(newRecipients);
      }
    } catch {
      setMultipleRecipientsError("Invalid CSV format");
    }
  };

  const getMultipleTotalAmount = useCallback(() => {
    return multipleRecipients.reduce((total, recipient) => {
      const amount = Number(recipient.amount.replace(/,/g, "")) || 0;
      return total + amount;
    }, 0);
  }, [multipleRecipients]);

  // Multiple Vesting submission handler
  const handleCreateMultipleVestingSchedule = async () => {
    if (!validateMultipleRecipients()) return;

    const validRecipients = multipleRecipients.filter(
      (r) => r.address && r.amount && !r.error
    );

    try {
      const addresses = validRecipients.map((r) => r.address);
      const amounts = validRecipients.map((r) => r.amount);

      const hash = await tokenLock.multipleVestingLock(
        addresses,
        amounts,
        tokenAddress,
        tokenInfo.decimals,
        tgeDate,
        tgeBps,
        cycle,
        cycleBps,
        "Multiple Vesting Lock" // description
      );

      if (hash) {
        // Reset form
        setMultipleRecipients([
          { address: "", amount: "", email: "", error: "" },
        ]);
        setTgeDate("");
        setEndTime("");
        // Navigate to vesting schedules page
        navigate("/vesting-schedules");
      }
    } catch (error) {
      console.error("Error creating multiple vesting schedules:", error);
    }
  };

  // Format cycle duration for display
  const formatCycleDuration = (seconds) => {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
  };

  // Quick TGE period
  const setQuickTgePeriod = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setTgeDate(date.toISOString().slice(0, 16));
    setTgeDateError("");
    calculateVestingSchedule();
  };

  // Cycle presets
  const setCyclePreset = (days) => {
    const seconds = days * 86400;
    setCycle(seconds.toString());
    setCycleError("");
    calculateVestingSchedule();
  };

  // Vesting calculation function
  const calculateVestingSchedule = useCallback(
    (
      amountValue = getMultipleTotalAmount(),
      tgeBpsValue = tgeBps,
      cycleValue = cycle,
      cycleBpsValue = cycleBps
    ) => {
      if (!amountValue || !tgeBpsValue || !cycleValue || !cycleBpsValue) {
        setVestingDetails(null);
        return;
      }

      const totalAmount = Number(amountValue);
      const initialReleaseBps = Number(tgeBpsValue);
      const cycleReleaseBps = Number(cycleBpsValue);

      const initialRelease = (totalAmount * initialReleaseBps) / 10000;
      const remainingAmount = totalAmount - initialRelease;
      const cycleReleaseAmount = (totalAmount * cycleReleaseBps) / 10000;

      let totalCycles = 0;
      if (cycleReleaseAmount > 0) {
        totalCycles = Math.ceil(remainingAmount / cycleReleaseAmount);
      }

      setVestingDetails({
        initialRelease,
        cycleReleaseAmount,
        totalCycles,
        remainingAmount,
        totalDays: Math.ceil((totalCycles * Number(cycleValue)) / 86400),
      });
    },
    [tgeBps, cycle, cycleBps, getMultipleTotalAmount]
  );

  // Vesting handlers
  const handleTgeDateChange = (e) => {
    const value = e.target.value;
    setTgeDate(value);
    const selectedDate = new Date(value);
    const now = new Date();
    if (selectedDate <= now) {
      setTgeDateError("TGE date must be in the future");
    } else {
      setTgeDateError("");
    }
    calculateVestingSchedule();
  };

  const handleTgeBpsChange = (e) => {
    const value = e.target.value;
    setTgeBps(value);
    if (value && isNaN(Number(value))) {
      setTgeBpsError("Please enter a valid number");
    } else if (value && (Number(value) < 0 || Number(value) > 10000)) {
      setTgeBpsError("Value must be between 0 and 10000");
    } else {
      setTgeBpsError("");
    }
    calculateVestingSchedule();
  };

  const handleCycleChange = (e) => {
    const value = e.target.value;
    setCycle(value);
    if (value && isNaN(Number(value))) {
      setCycleError("Please enter a valid number");
    } else if (value && Number(value) <= 0) {
      setCycleError("Cycle must be greater than 0");
    } else {
      setCycleError("");
    }
    calculateVestingSchedule();
  };

  const handleCycleBpsChange = (e) => {
    const value = e.target.value;
    setCycleBps(value);
    if (value && isNaN(Number(value))) {
      setCycleBpsError("Please enter a valid number");
    } else if (value && (Number(value) < 0 || Number(value) > 10000)) {
      setCycleBpsError("Value must be between 0 and 10000");
    } else {
      setCycleBpsError("");
    }
    calculateVestingSchedule();
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#004581] to-[#018ABD]"
            whileHover={{ scale: 1.05 }}
          >
            <BarChart3 className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold text-[#97CBDC]">
              Payroll Vesting Manager
            </h1>
            <p className="text-[#97CBDC]/70">
              Create and manage token vesting schedules
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/50 text-[#97CBDC] hover:bg-[#0a0a20] transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm">Help</span>
        </button>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-[#0a0a20]/80 border border-[#475B74]/50 overflow-hidden"
          >
            <h3 className="text-lg font-medium text-[#97CBDC] mb-2">
              Payroll Vesting Manager
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-[#1D2538]/50 border border-[#475B74]/30">
                <h4 className="font-medium text-[#97CBDC] mb-2">
                  Smart Payroll Vesting
                </h4>
                <p className="text-sm text-[#97CBDC]/80">
                  Add one recipient for single vesting or multiple recipients
                  for batch vesting. The system automatically chooses the
                  optimal contract function.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[#1D2538]/50 border border-[#475B74]/30">
                <h4 className="font-medium text-[#97CBDC] mb-2">
                  Flexible Payroll Vesting Management
                </h4>
                <p className="text-sm text-[#97CBDC]/80">
                  Import recipients via CSV, use contact picker, or manually add
                  each recipient. All schedules share the same vesting
                  parameters.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 p-1 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl">
          <button
            onClick={() => setActiveTab("unified")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "unified"
                ? "bg-[#018ABD] text-white"
                : "text-[#97CBDC]/70 hover:text-[#97CBDC] hover:bg-[#0a0a20]/50 cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Payroll Vesting
            </div>
          </button>
          <button
            onClick={() => setActiveTab("multivesting")}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "multivesting"
                ? "bg-[#018ABD] text-white"
                : "text-[#97CBDC]/70 hover:text-[#97CBDC] hover:bg-[#0a0a20]/50 cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Investor Payroll
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "unified" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <UnifiedVestingForm
              tokenAddress={tokenAddress}
              tokenSelection={tokenSelection}
              predefinedTokens={predefinedTokens}
              tokenInfo={tokenInfo}
              isLoadingToken={isLoadingToken}
              tokenError={tokenError}
              recipients={recipients}
              startTime={startTime}
              endTime={endTime}
              unlockSchedule={unlockSchedule}
              autoClaim={autoClaim}
              cancelPermission={cancelPermission}
              changeRecipientPermission={changeRecipientPermission}
              csvInput={csvInput}
              showCsvInput={showCsvInput}
              errors={errors}
              showTooltip={showTooltip}
              minDateTime={minDateTime}
              tokenLock={tokenLock}
              onTokenSelectionChange={setTokenSelection}
              onTokenAddressChange={handleTokenAddressChange}
              onStartTimeChange={setStartTime}
              onEndTimeChange={setEndTime}
              onUnlockScheduleChange={setUnlockSchedule}
              onAutoClaimChange={setAutoClaim}
              onCancelPermissionChange={setCancelPermission}
              onChangeRecipientPermissionChange={setChangeRecipientPermission}
              onAddRecipient={addRecipient}
              onRemoveRecipient={removeRecipient}
              onUpdateRecipient={updateRecipient}
              onCsvInputChange={setCsvInput}
              onShowCsvInputChange={setShowCsvInput}
              onParseCsvInput={parseCsvInput}
              onShowTooltip={setShowTooltip}
              onCreateVestingSchedule={handleCreateVestingSchedule}
            />
          </motion.div>
        )}

        {activeTab === "multivesting" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <MultipleVestingForm
              tokenAddress={tokenAddress}
              tokenSelection={tokenSelection}
              predefinedTokens={predefinedTokens}
              tokenInfo={tokenInfo}
              isLoadingToken={isLoadingToken}
              tokenError={tokenError}
              multipleRecipients={multipleRecipients}
              multipleRecipientsError={multipleRecipientsError}
              multipleCsvInput={multipleCsvInput}
              showMultipleCsvInput={showMultipleCsvInput}
              openPickerIndex={openPickerIndex}
              tgeDate={tgeDate}
              tgeBps={tgeBps}
              cycle={cycle}
              cycleBps={cycleBps}
              tgeDateError={tgeDateError}
              tgeBpsError={tgeBpsError}
              cycleError={cycleError}
              cycleBpsError={cycleBpsError}
              vestingDetails={vestingDetails}
              endTime={endTime}
              autoClaim={autoClaim}
              cancelPermission={cancelPermission}
              changeRecipientPermission={changeRecipientPermission}
              errors={errors}
              showTooltip={showTooltip}
              minDateTime={minDateTime}
              tokenLock={tokenLock}
              onTokenSelectionChange={setTokenSelection}
              onTokenAddressChange={handleTokenAddressChange}
              onEndTimeChange={setEndTime}
              onAutoClaimChange={setAutoClaim}
              onCancelPermissionChange={setCancelPermission}
              onChangeRecipientPermissionChange={setChangeRecipientPermission}
              onAddMultipleRecipient={addMultipleRecipient}
              onRemoveMultipleRecipient={removeMultipleRecipient}
              onUpdateMultipleRecipient={updateMultipleRecipient}
              onMultipleCsvInputChange={setMultipleCsvInput}
              onShowMultipleCsvInputChange={setShowMultipleCsvInput}
              onParseMultipleCsvInput={parseMultipleCsvInput}
              onSetOpenPickerIndex={setOpenPickerIndex}
              onTgeDateChange={handleTgeDateChange}
              onTgeBpsChange={handleTgeBpsChange}
              onCycleChange={handleCycleChange}
              onCycleBpsChange={handleCycleBpsChange}
              setQuickTgePeriod={setQuickTgePeriod}
              setCyclePreset={setCyclePreset}
              formatCycleDuration={formatCycleDuration}
              getMultipleTotalAmount={getMultipleTotalAmount}
              onShowTooltip={setShowTooltip}
              onCreateMultipleVestingSchedule={
                handleCreateMultipleVestingSchedule
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Unified Vesting Form Component
function UnifiedVestingForm({
  tokenAddress,
  tokenSelection,
  predefinedTokens,
  tokenInfo,
  isLoadingToken,
  tokenError,
  recipients,
  startTime,
  endTime,
  unlockSchedule,
  autoClaim,
  cancelPermission,
  changeRecipientPermission,
  csvInput,
  showCsvInput,
  errors,
  showTooltip,
  minDateTime,
  tokenLock,
  onTokenSelectionChange,
  onTokenAddressChange,
  onStartTimeChange,
  onEndTimeChange,
  onUnlockScheduleChange,
  onAutoClaimChange,
  onCancelPermissionChange,
  onChangeRecipientPermissionChange,
  onAddRecipient,
  onRemoveRecipient,
  onUpdateRecipient,
  onCsvInputChange,
  onShowCsvInputChange,
  onParseCsvInput,
  onShowTooltip,
  onCreateVestingSchedule,
}) {
  const [showContactPicker, setShowContactPicker] = useState(false);
  return (
    <div className="p-6 rounded-3xl border border-[#475B74]/50 bg-gradient-to-b from-[#1D2538]/90 to-[#1D2538] shadow-lg space-y-6">
      {/* Token Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[#97CBDC]">
          Select Token <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(predefinedTokens).map(([key, token]) => (
            <motion.div
              key={key}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                tokenSelection === key
                  ? "border-[#018ABD] bg-[#018ABD]/10"
                  : "border-[#475B74]/50 bg-[#0a0a20]/50 hover:border-[#018ABD]/50"
              }`}
              onClick={() => {
                onTokenSelectionChange(key);
                onTokenAddressChange({ target: { value: token.address } });
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="tokenSelection"
                  checked={tokenSelection === key}
                  onChange={() => {}}
                  className="text-[#018ABD] focus:ring-[#018ABD]/50"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                      {key === "usdt" ? (
                        <img
                          src="/usdt.png"
                          alt="USDT"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : key === "usdc" ? (
                        <img
                          src="/usdc.png"
                          alt="USDC"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#26A17B] to-[#26A17B] flex items-center justify-center text-white text-xs font-bold">
                          {token.symbol[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#97CBDC]">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-[#97CBDC]/70">
                        {token.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              tokenSelection === "custom"
                ? "border-[#018ABD] bg-[#018ABD]/10"
                : "border-[#475B74]/50 bg-[#0a0a20]/50 hover:border-[#018ABD]/50"
            }`}
            onClick={() => {
              onTokenSelectionChange("custom");
              onTokenAddressChange({ target: { value: "" } });
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="tokenSelection"
                checked={tokenSelection === "custom"}
                onChange={() => {}}
                className="text-[#018ABD] focus:ring-[#018ABD]/50"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#475B74] to-[#475B74] flex items-center justify-center text-white text-xs font-bold">
                    ?
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#97CBDC]">
                      Custom Token
                    </div>
                    <div className="text-xs text-[#97CBDC]/70">
                      Enter token address
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Custom Token Address Input */}
        <AnimatePresence>
          {tokenSelection === "custom" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <div className="relative">
                <input
                  value={tokenAddress}
                  onChange={onTokenAddressChange}
                  placeholder="0x..."
                  className={`w-full bg-[#0a0a20]/80 border ${
                    errors.tokenAddress
                      ? "border-red-500"
                      : tokenInfo
                        ? "border-green-500"
                        : "border-[#475B74]/50"
                  } rounded-xl p-3 text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50 pr-10`}
                />
                {isLoadingToken && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-[#97CBDC]/70 animate-spin" />
                  </div>
                )}
                {tokenInfo && !isLoadingToken && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {errors.tokenAddress && (
                <p className="text-sm text-red-500">{errors.tokenAddress}</p>
              )}
              {tokenError && (
                <p className="text-sm text-red-500">{tokenError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token Info Display */}
        <AnimatePresence>
          {tokenInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#004581]/20 to-[#018ABD]/20 flex items-center justify-center text-[#97CBDC] font-medium">
                  {tokenInfo.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#97CBDC]">
                    {tokenInfo.name}
                  </div>
                  <div className="text-xs text-[#97CBDC]/70">
                    {tokenInfo.symbol} • {tokenInfo.decimals} decimals
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="p-2 rounded-lg bg-[#0a0a20]/50">
                  <div className="text-[#97CBDC]/70 text-xs mb-1">
                    Your Balance:
                  </div>
                  <div className="text-[#97CBDC] font-medium">
                    {Number(tokenInfo.balance).toLocaleString()}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#0a0a20]/50">
                  <div className="text-[#97CBDC]/70 text-xs mb-1">
                    Total Supply:
                  </div>
                  <div className="text-[#97CBDC] font-medium">
                    {Number(tokenInfo.totalSupply).toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipients Management */}
      <div className="p-4 rounded-xl bg-[#0a0a20]/50 border border-[#475B74]/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#97CBDC] flex items-center gap-2">
            <Users className="w-4 h-4" />
            Recipients ({recipients.length})
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onShowCsvInputChange(!showCsvInput)}
              className="px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              CSV Import
            </button>
            <button
              type="button"
              onClick={onAddRecipient}
              className="px-3 py-1.5 text-xs bg-[#018ABD]/20 border border-[#018ABD]/50 rounded-lg text-[#018ABD] hover:bg-[#018ABD]/30 transition-colors flex items-center gap-1"
            >
              <Users className="w-3 h-3" />
              Add Recipient
            </button>
          </div>
        </div>

        {/* CSV Input Section */}
        <AnimatePresence>
          {showCsvInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/30 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#97CBDC]">
                  CSV Format: address,amount,title,email (one per line)
                </label>
                <button
                  type="button"
                  onClick={() => onShowCsvInputChange(false)}
                  className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                >
                  ×
                </button>
              </div>
              <textarea
                value={csvInput}
                onChange={(e) => onCsvInputChange(e.target.value)}
                placeholder={`0x1234...abcd,1000,Team Member 1,member1@example.com\n0x5678...efgh,2000,Team Member 2,member2@example.com\n0x9abc...ijkl,1500,Team Member 3,member3@example.com`}
                className="w-full h-20 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={onParseCsvInput}
                  className="px-3 py-1.5 text-xs bg-[#018ABD]/20 border border-[#018ABD]/50 rounded-lg text-[#018ABD] hover:bg-[#018ABD]/30 transition-colors"
                >
                  Import CSV
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipients List */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {recipients.map((recipient, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-[#97CBDC]/70 min-w-[60px]">
                  #{index + 1}
                </span>
                {recipients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveRecipient(index)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors ml-auto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs text-[#97CBDC]/70">
                      Address *
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowContactPicker(
                          showContactPicker === index ? null : index
                        )
                      }
                      className="text-[10px] px-2 py-0.5 rounded bg-[#018ABD]/20 text-[#018ABD] hover:bg-[#018ABD]/30 transition-colors"
                    >
                      {showContactPicker === index ? "Hide" : "Select"}
                    </button>
                  </div>
                  {showContactPicker === index && (
                    <div className="mb-2">
                      <ContactSelector
                        placeholder="Search contacts"
                        showEmail
                        onSelect={(contact) => {
                          onUpdateRecipient(
                            index,
                            "address",
                            contact.walletAddress
                          );
                          onUpdateRecipient(
                            index,
                            "email",
                            contact.email || ""
                          );
                          setShowContactPicker(null);
                        }}
                      />
                    </div>
                  )}
                  <input
                    value={recipient.address}
                    onChange={(e) =>
                      onUpdateRecipient(index, "address", e.target.value)
                    }
                    placeholder="0x..."
                    className={`w-full bg-[#0a0a20]/80 border ${
                      recipient.error && recipient.error.includes("address")
                        ? "border-red-500"
                        : recipient.address
                          ? "border-[#018ABD]"
                          : "border-[#475B74]/50"
                    } rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#97CBDC]/70 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <input
                      value={recipient.amount}
                      onChange={(e) =>
                        onUpdateRecipient(index, "amount", e.target.value)
                      }
                      placeholder="1000"
                      className={`w-full bg-[#0a0a20]/80 border ${
                        recipient.error && recipient.error.includes("amount")
                          ? "border-red-500"
                          : recipient.amount
                            ? "border-[#018ABD]"
                            : "border-[#475B74]/50"
                      } rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50 pr-12`}
                    />
                    {tokenInfo && recipient.amount && !recipient.error && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#97CBDC]/70 text-xs">
                        {tokenInfo.symbol}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-xs text-[#97CBDC]/70 mb-1">
                    Title (Optional)
                  </label>
                  <input
                    value={recipient.title}
                    onChange={(e) =>
                      onUpdateRecipient(index, "title", e.target.value)
                    }
                    placeholder="Team Member"
                    className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#97CBDC]/70 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={recipient.email}
                    onChange={(e) =>
                      onUpdateRecipient(index, "email", e.target.value)
                    }
                    placeholder="member@example.com"
                    className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50"
                  />
                </div>
              </div>
              {recipient.error && (
                <p className="text-xs text-red-500 mt-1">{recipient.error}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Total Summary */}
        {recipients.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/30">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#97CBDC]/70">Total Amount:</span>
              <span className="text-[#97CBDC] font-medium">
                {recipients
                  .reduce((total, recipient) => {
                    const amount =
                      Number(recipient.amount.replace(/,/g, "")) || 0;
                    return total + amount;
                  }, 0)
                  .toLocaleString()}{" "}
                {tokenInfo?.symbol || "tokens"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Time Settings */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#97CBDC]">
            Start Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              min={minDateTime}
              className={`w-full bg-[#0a0a20]/80 border ${
                errors.startTime
                  ? "border-red-500"
                  : startTime
                    ? "border-[#018ABD]"
                    : "border-[#475B74]/50"
              } rounded-xl p-3 text-[#97CBDC] focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50 pr-10`}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#97CBDC]/70 w-5 h-5" />
          </div>
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#97CBDC]">
            End Time <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              min={startTime || minDateTime}
              className={`w-full bg-[#0a0a20]/80 border ${
                errors.endTime
                  ? "border-red-500"
                  : endTime
                    ? "border-[#018ABD]"
                    : "border-[#475B74]/50"
              } rounded-xl p-3 text-[#97CBDC] focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50 pr-10`}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#97CBDC]/70 w-5 h-5" />
          </div>
          {errors.endTime && (
            <p className="text-sm text-red-500">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Unlock Schedule */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#97CBDC]">
          Unlock Schedule <span className="text-red-500">*</span>
        </label>
        <select
          value={unlockSchedule}
          onChange={(e) => onUnlockScheduleChange(Number(e.target.value))}
          className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl p-3 text-[#97CBDC] focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50"
        >
          <option value={UnlockSchedule.SECOND}>Every Second</option>
          <option value={UnlockSchedule.MINUTE}>Every Minute</option>
          <option value={UnlockSchedule.HOUR}>Every Hour</option>
          <option value={UnlockSchedule.DAILY}>Daily</option>
          <option value={UnlockSchedule.WEEKLY}>Weekly</option>
          <option value={UnlockSchedule.BIWEEKLY}>Bi-weekly</option>
          <option value={UnlockSchedule.MONTHLY}>Monthly</option>
          <option value={UnlockSchedule.QUARTERLY}>Quarterly</option>
          <option value={UnlockSchedule.YEARLY}>Yearly</option>
        </select>
      </div>

      {/* Optional Settings */}
      <div className="p-4 rounded-xl bg-[#0a0a20]/50 border border-[#475B74]/30">
        <h3 className="text-sm font-medium text-[#97CBDC] mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Optional Settings
        </h3>

        <div className="space-y-4">
          {/* Auto Claim */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoClaim"
              checked={autoClaim}
              onChange={(e) => onAutoClaimChange(e.target.checked)}
              className="rounded border-[#475B74] text-[#018ABD] focus:ring-[#018ABD]/50"
            />
            <label htmlFor="autoClaim" className="text-sm text-[#97CBDC]">
              Enable auto-claim
            </label>
            <div className="relative">
              <button
                type="button"
                className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                onMouseEnter={() => onShowTooltip("autoClaim")}
                onMouseLeave={() => onShowTooltip("")}
              >
                <Info className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showTooltip === "autoClaim" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 z-10 w-64 p-3 text-xs bg-[#0a0a20] border border-[#475B74]/50 rounded-xl shadow-lg text-[#97CBDC]/90"
                  >
                    When enabled, tokens will be automatically released to the
                    recipient according to the schedule.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Permissions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#97CBDC]">
                Cancel Permission
              </label>
              <select
                value={cancelPermission}
                onChange={(e) =>
                  onCancelPermissionChange(Number(e.target.value))
                }
                className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl p-3 text-[#97CBDC] focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50"
              >
                <option value={CancelPermission.NONE}>None</option>
                <option value={CancelPermission.SENDER_ONLY}>
                  Sender Only
                </option>
                <option value={CancelPermission.RECIPIENT_ONLY}>
                  Recipient Only
                </option>
                <option value={CancelPermission.BOTH}>Both</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#97CBDC]">
                Change Recipient Permission
              </label>
              <select
                value={changeRecipientPermission}
                onChange={(e) =>
                  onChangeRecipientPermissionChange(Number(e.target.value))
                }
                className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl p-3 text-[#97CBDC] focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50"
              >
                <option value={ChangeRecipientPermission.NONE}>None</option>
                <option value={ChangeRecipientPermission.SENDER_ONLY}>
                  Sender Only
                </option>
                <option value={ChangeRecipientPermission.RECIPIENT_ONLY}>
                  Recipient Only
                </option>
                <option value={ChangeRecipientPermission.BOTH}>Both</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={onCreateVestingSchedule}
          disabled={
            tokenLock.isProcessing ||
            !tokenAddress ||
            recipients.length === 0 ||
            !startTime ||
            !endTime ||
            recipients.some((r) => !r.address || !r.amount || r.error) ||
            Object.values(errors).some((error) => error)
          }
          className="px-8 py-3 h-12 text-white font-medium rounded-xl bg-gradient-to-r from-[#004581] to-[#018ABD] hover:from-[#003b6e] hover:to-[#0179a3] transition-all duration-300 shadow-lg shadow-[#004581]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tokenLock.isProcessing ? (
            <span className="flex items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {tokenLock.isApproving
                ? "Approving..."
                : recipients.length === 1
                  ? "Creating Schedule..."
                  : "Creating Schedules..."}
            </span>
          ) : (
            `Create ${recipients.length} Vesting Schedule${recipients.length > 1 ? "s" : ""}`
          )}
        </motion.button>
      </div>
    </div>
  );
}

// Multiple Vesting Form Component
function MultipleVestingForm({
  tokenAddress,
  tokenSelection,
  predefinedTokens,
  tokenInfo,
  isLoadingToken,
  tokenError,
  multipleRecipients,
  multipleRecipientsError,
  multipleCsvInput,
  showMultipleCsvInput,
  openPickerIndex,
  tgeDate,
  tgeBps,
  cycle,
  cycleBps,
  tgeDateError,
  tgeBpsError,
  cycleError,
  cycleBpsError,
  errors,
  showTooltip,
  minDateTime,
  tokenLock,
  onTokenSelectionChange,
  onTokenAddressChange,
  onAddMultipleRecipient,
  onRemoveMultipleRecipient,
  onUpdateMultipleRecipient,
  onMultipleCsvInputChange,
  onShowMultipleCsvInputChange,
  onParseMultipleCsvInput,
  onOpenPickerIndexChange,
  onTgeDateChange,
  onTgeBpsChange,
  onCycleChange,
  onCycleBpsChange,
  onShowTooltip,
  onCreateMultipleVestingSchedule,
  formatCycleDuration,
  setQuickTgePeriod,
  setCyclePreset,
  getMultipleTotalAmount,
}) {
  return (
    <div className="p-6 rounded-3xl border border-[#475B74]/50 bg-gradient-to-b from-[#1D2538]/90 to-[#1D2538] shadow-lg space-y-6">
      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#018ABD] text-white text-sm font-medium">
              1
            </div>
            <div className="ml-2 text-[#97CBDC] font-medium">Token Details</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#97CBDC]/50" />
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                tokenInfo
                  ? "bg-[#018ABD] text-white"
                  : "bg-[#0a0a20]/80 text-[#97CBDC]/50"
              } text-sm font-medium`}
            >
              2
            </div>
            <div
              className={`ml-2 ${tokenInfo ? "text-[#97CBDC]" : "text-[#97CBDC]/50"} font-medium`}
            >
              Recipients
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#97CBDC]/50" />
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${
                tokenInfo && multipleRecipients.length > 0 && tgeDate
                  ? "bg-[#018ABD] text-white"
                  : "bg-[#0a0a20]/80 text-[#97CBDC]/50"
              } text-sm font-medium`}
            >
              3
            </div>
            <div
              className={`ml-2 ${
                tokenInfo && multipleRecipients.length > 0 && tgeDate
                  ? "text-[#97CBDC]"
                  : "text-[#97CBDC]/50"
              } font-medium`}
            >
              Review & Submit
            </div>
          </div>
        </div>
        <div className="mt-2 h-1 bg-[#0a0a20]/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#004581] to-[#018ABD]"
            style={{
              width: tokenInfo
                ? multipleRecipients.length > 0 && tgeDate
                  ? "100%"
                  : "66%"
                : "33%",
            }}
          ></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Token Selection and Address Field */}
        <div className="space-y-4">
          {/* Token Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#97CBDC]">
              Select Token <span className="text-red-500">*</span>
            </label>

            {/* Token Selection Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* USDT Option */}
              <motion.div
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  tokenSelection === "usdt"
                    ? "border-[#018ABD] bg-[#018ABD]/10"
                    : "border-[#475B74]/50 bg-[#0a0a20]/50 hover:border-[#018ABD]/50"
                }`}
                onClick={() => {
                  onTokenSelectionChange("usdt");
                  onTokenAddressChange({
                    target: { value: predefinedTokens.usdt.address },
                  });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tokenSelection"
                    checked={tokenSelection === "usdt"}
                    onChange={() => {}}
                    className="text-[#018ABD] focus:ring-[#018ABD]/50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <img
                          src="/usdt.png"
                          alt="USDT"
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#97CBDC]">
                          USDT
                        </div>
                        <div className="text-xs text-[#97CBDC]/70">
                          Tether USD
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* USDC Option */}
              <motion.div
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  tokenSelection === "usdc"
                    ? "border-[#018ABD] bg-[#018ABD]/10"
                    : "border-[#475B74]/50 bg-[#0a0a20]/50 hover:border-[#018ABD]/50"
                }`}
                onClick={() => {
                  onTokenSelectionChange("usdc");
                  onTokenAddressChange({
                    target: { value: predefinedTokens.usdc.address },
                  });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tokenSelection"
                    checked={tokenSelection === "usdc"}
                    onChange={() => {}}
                    className="text-[#018ABD] focus:ring-[#018ABD]/50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <img
                          src="/usdc.png"
                          alt="USDC"
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#97CBDC]">
                          USDC
                        </div>
                        <div className="text-xs text-[#97CBDC]/70">
                          USD Coin
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Custom Token Option */}
              <motion.div
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  tokenSelection === "custom"
                    ? "border-[#018ABD] bg-[#018ABD]/10"
                    : "border-[#475B74]/50 bg-[#0a0a20]/50 hover:border-[#018ABD]/50"
                }`}
                onClick={() => {
                  onTokenSelectionChange("custom");
                  onTokenAddressChange({ target: { value: "" } });
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="tokenSelection"
                    checked={tokenSelection === "custom"}
                    onChange={() => {}}
                    className="text-[#018ABD] focus:ring-[#018ABD]/50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#475B74] to-[#475B74] flex items-center justify-center text-white text-xs font-bold">
                        ?
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#97CBDC]">
                          Custom Token
                        </div>
                        <div className="text-xs text-[#97CBDC]/70">
                          Enter token address
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Custom Token Address Input - Only show when custom is selected */}
          <AnimatePresence>
            {tokenSelection === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#97CBDC]">
                    Token address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                      onMouseEnter={() => onShowTooltip("token")}
                      onMouseLeave={() => onShowTooltip("")}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {showTooltip === "token" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 z-10 w-64 p-3 text-xs bg-[#0a0a20] border border-[#475B74]/50 rounded-xl shadow-lg text-[#97CBDC]/90"
                        >
                          Enter the contract address of the token you want to
                          create vesting schedules for.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="relative">
                  <input
                    value={tokenAddress}
                    onChange={onTokenAddressChange}
                    placeholder="0x..."
                    className={`w-full bg-[#0a0a20]/80 border ${
                      errors.tokenAddress
                        ? "border-red-500"
                        : tokenInfo
                          ? "border-green-500"
                          : "border-[#475B74]/50"
                    } rounded-xl p-3 text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50 pr-10`}
                  />
                  {isLoadingToken && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-[#97CBDC]/70 animate-spin" />
                    </div>
                  )}
                  {tokenInfo && !isLoadingToken && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>
                {errors.tokenAddress && (
                  <p className="text-sm text-red-500">{errors.tokenAddress}</p>
                )}
                {tokenError && (
                  <p className="text-sm text-red-500">{tokenError}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Token Info Display */}
          <AnimatePresence>
            {tokenInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#004581]/20 to-[#018ABD]/20 flex items-center justify-center text-[#97CBDC] font-medium">
                    {tokenInfo.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#97CBDC]">
                      {tokenInfo.name}
                    </div>
                    <div className="text-xs text-[#97CBDC]/70">
                      {tokenInfo.symbol} • {tokenInfo.decimals} decimals
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="p-2 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-xs mb-1">
                      Your Balance:
                    </div>
                    <div className="text-[#97CBDC] font-medium">
                      {Number(tokenInfo.balance).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0a0a20]/50">
                    <div className="text-[#97CBDC]/70 text-xs mb-1">
                      Total Supply:
                    </div>
                    <div className="text-[#97CBDC] font-medium">
                      {Number(tokenInfo.totalSupply).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vesting Schedule Settings */}
        <div className="p-4 rounded-xl bg-[#0a0a20]/50 border border-[#475B74]/30">
          <h3 className="text-sm font-medium text-[#97CBDC] mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Vesting Schedule
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              {/* TGE Date Field */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#97CBDC]">
                    TGE Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                      onMouseEnter={() => onShowTooltip("tgeDate")}
                      onMouseLeave={() => onShowTooltip("")}
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {showTooltip === "tgeDate" && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 z-10 w-64 p-3 text-xs bg-[#0a0a20] border border-[#475B74]/50 rounded-xl shadow-lg text-[#97CBDC]/90"
                        >
                          Token Generation Event date - when the initial token
                          release will occur.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={tgeDate}
                    onChange={onTgeDateChange}
                    min={minDateTime}
                    className={`w-full bg-[#0a0a20]/80 border ${
                      tgeDateError
                        ? "border-red-500"
                        : tgeDate
                          ? "border-[#018ABD]"
                          : "border-[#475B74]/50"
                    } rounded-xl p-3 text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-2 focus:ring-[#018ABD]/50 pr-10`}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#97CBDC]/70 w-5 h-5" />
                </div>
                {tgeDateError && (
                  <p className="text-sm text-red-500">{tgeDateError}</p>
                )}
              </div>
              {/* Quick TGE Date Buttons */}
              <div className="mb-4">
                <div className="text-xs text-[#97CBDC]/70 mb-2">
                  Quick select:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickTgePeriod(1)}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTgePeriod(7)}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors"
                  >
                    1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTgePeriod(30)}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors"
                  >
                    1 Month
                  </button>
                </div>
              </div>
              {/* TGE BPS Field */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <label className="block text-sm font-medium text-[#97CBDC]">
                      Initial Release % <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                        onMouseEnter={() => onShowTooltip("tgeBps")}
                        onMouseLeave={() => onShowTooltip("")}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {showTooltip === "tgeBps" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 z-10 w-64 p-3 text-xs bg-[#0a0a20] border border-[#475B74]/50 rounded-xl shadow-lg text-[#97CBDC]/90"
                          >
                            Percentage of tokens released immediately at TGE
                            (0-100%).
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={tgeBps}
                    onChange={onTgeBpsChange}
                    className="w-full h-2 bg-[#0a0a20] rounded-lg appearance-none cursor-pointer accent-[#018ABD]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-[#97CBDC]/70">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={tgeBps}
                    onChange={onTgeBpsChange}
                    className="w-20 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50"
                  />
                  <div className="text-[#97CBDC] font-medium">
                    {(Number(tgeBps) / 100).toFixed(2)}%
                  </div>
                </div>
                {tgeBpsError && (
                  <p className="text-sm text-red-500">{tgeBpsError}</p>
                )}
              </div>
              {/* Cycle Field */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <label className="block text-sm font-medium text-[#97CBDC]">
                      Release Cycle <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                        onMouseEnter={() => onShowTooltip("cycle")}
                        onMouseLeave={() => onShowTooltip("")}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {showTooltip === "cycle" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 z-10 w-64 p-3 text-xs bg-[#0a0a20] border border-[#475B74]/50 rounded-xl shadow-lg text-[#97CBDC]/90"
                          >
                            How often tokens are released after TGE.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cycle}
                      onChange={onCycleChange}
                      className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50"
                    />
                  </div>
                  <div className="text-[#97CBDC] font-medium whitespace-nowrap">
                    {formatCycleDuration(Number(cycle))}
                  </div>
                </div>
                {cycleError && (
                  <p className="text-sm text-red-500">{cycleError}</p>
                )}
              </div>
              {/* Quick Cycle Buttons */}
              <div className="mb-4">
                <div className="text-xs text-[#97CBDC]/70 mb-2">
                  Quick select:
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCyclePreset(1)}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors"
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setCyclePreset(7)}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors"
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setCyclePreset(30)}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors"
                  >
                    Monthly
                  </button>
                </div>
              </div>
              {/* Cycle BPS Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <label className="block text-sm font-medium text-[#97CBDC]">
                      Release Per Cycle %{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                        onMouseEnter={() => onShowTooltip("cycleBps")}
                        onMouseLeave={() => onShowTooltip("")}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {showTooltip === "cycleBps" && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute left-0 z-10 w-64 p-3 text-xs bg-[#0a0a20] border border-[#475B74]/50 rounded-xl shadow-lg text-[#97CBDC]/90"
                          >
                            Percentage of tokens released in each cycle
                            (0-100%).
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={cycleBps}
                    onChange={onCycleBpsChange}
                    className="w-full h-2 bg-[#0a0a20] rounded-lg appearance-none cursor-pointer accent-[#018ABD]"
                  />
                  <div className="flex justify-between mt-1 text-xs text-[#97CBDC]/70">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cycleBps}
                    onChange={onCycleBpsChange}
                    className="w-20 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50"
                  />
                  <div className="text-[#97CBDC] font-medium">
                    {(Number(cycleBps) / 100).toFixed(2)}%
                  </div>
                </div>
                {cycleBpsError && (
                  <p className="text-sm text-red-500">{cycleBpsError}</p>
                )}
              </div>
            </div>
            {/* Multiple Vesting Summary */}
            <div>
              {multipleRecipients.length > 0 && tgeBps && cycleBps && (
                <div className="p-4 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-xl h-full">
                  <h3 className="text-sm font-medium text-[#97CBDC] mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Multiple Vesting Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-[#0a0a20]/50">
                      <div className="flex items-center gap-1 text-[#97CBDC]/70">
                        <Users className="w-3 h-3" />
                        Recipients:
                      </div>
                      <div className="text-[#97CBDC] font-medium">
                        {multipleRecipients.length}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-[#0a0a20]/50">
                      <div className="flex items-center gap-1 text-[#97CBDC]/70">
                        <BarChart2 className="w-3 h-3" />
                        Total Amount:
                      </div>
                      <div className="text-[#97CBDC] font-medium">
                        {getMultipleTotalAmount().toLocaleString()}{" "}
                        {tokenInfo?.symbol}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-[#0a0a20]/50">
                      <div className="flex items-center gap-1 text-[#97CBDC]/70">
                        <Percent className="w-3 h-3" />
                        Initial Release:
                      </div>
                      <div className="text-[#97CBDC] font-medium">
                        {(Number(tgeBps) / 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-[#0a0a20]/50">
                      <div className="flex items-center gap-1 text-[#97CBDC]/70">
                        <Clock className="w-3 h-3" />
                        Release Cycle:
                      </div>
                      <div className="text-[#97CBDC] font-medium">
                        {formatCycleDuration(Number(cycle))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-[#0a0a20]/50">
                      <div className="flex items-center gap-1 text-[#97CBDC]/70">
                        <Percent className="w-3 h-3" />
                        Per Cycle:
                      </div>
                      <div className="text-[#97CBDC] font-medium">
                        {(Number(cycleBps) / 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {multipleRecipients.length === 0 && (
                <div className="p-4 bg-[#0a0a20]/80 border border-[#475B74]/30 rounded-xl h-full flex items-center justify-center">
                  <div className="text-center text-[#97CBDC]/70">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Add recipients to see the summary</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipients Management */}
        <div className="p-4 rounded-xl bg-[#0a0a20]/50 border border-[#475B74]/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#97CBDC] flex items-center gap-2">
              <Users className="w-4 h-4" />
              Recipients ({multipleRecipients.length})
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onShowMultipleCsvInputChange(!showMultipleCsvInput)
                }
                className="cursor-pointer px-3 py-1.5 text-xs bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg text-[#97CBDC] hover:bg-[#0a0a20] hover:border-[#018ABD]/50 transition-colors flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                CSV Import
              </button>
              <button
                type="button"
                onClick={onAddMultipleRecipient}
                className="cursor-pointer px-3 py-1.5 text-xs bg-[#018ABD]/20 border border-[#018ABD]/50 rounded-lg text-[#018ABD] hover:bg-[#018ABD]/30 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Recipient
              </button>
            </div>
          </div>

          {/* CSV Input Section */}
          <AnimatePresence>
            {showMultipleCsvInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/30 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#97CBDC]">
                    CSV Format: address,amount,email (one per line)
                  </label>
                  <button
                    type="button"
                    onClick={() => onShowMultipleCsvInputChange(false)}
                    className="text-[#97CBDC]/70 hover:text-[#97CBDC] transition-colors"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  value={multipleCsvInput}
                  onChange={(e) => onMultipleCsvInputChange(e.target.value)}
                  placeholder={`0x1234...abcd,1000,member1@example.com\n0x5678...efgh,2000,member2@example.com\n0x9abc...ijkl,1500,member3@example.com`}
                  className="w-full h-20 bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={onParseMultipleCsvInput}
                    className="cursor-pointer px-3 py-1.5 text-xs bg-[#018ABD]/20 border border-[#018ABD]/50 rounded-lg text-[#018ABD] hover:bg-[#018ABD]/30 transition-colors"
                  >
                    Import CSV
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recipients List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {multipleRecipients.map((recipient, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-[#97CBDC]/70 min-w-[60px]">
                    #{index + 1}
                  </span>
                  {multipleRecipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveMultipleRecipient(index)}
                      className="cursor-pointer p-1 text-red-400 hover:text-red-300 transition-colors ml-auto"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-[#97CBDC]/70">
                        Address
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenPickerIndexChange(
                            openPickerIndex === index ? null : index
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-[#018ABD]/20 text-[#018ABD] hover:bg-[#018ABD]/30 transition-colors"
                      >
                        {openPickerIndex === index ? "Hide" : "Select"}
                      </button>
                    </div>
                    {openPickerIndex === index && (
                      <div className="mb-2">
                        <ContactSelector
                          placeholder="Search contacts"
                          showEmail
                          onSelect={(contact) => {
                            onUpdateMultipleRecipient(
                              index,
                              "address",
                              contact.walletAddress
                            );
                            onUpdateMultipleRecipient(
                              index,
                              "email",
                              contact.email || ""
                            );
                            onOpenPickerIndexChange(null);
                          }}
                        />
                      </div>
                    )}
                    <input
                      value={recipient.address}
                      onChange={(e) =>
                        onUpdateMultipleRecipient(
                          index,
                          "address",
                          e.target.value
                        )
                      }
                      placeholder="0x..."
                      className={`w-full bg-[#0a0a20]/80 border ${
                        recipient.error && recipient.error.includes("Address")
                          ? "border-red-500"
                          : recipient.address
                            ? "border-[#018ABD]"
                            : "border-[#475B74]/50"
                      } rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#97CBDC]/70 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        value={recipient.amount}
                        onChange={(e) =>
                          onUpdateMultipleRecipient(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        placeholder="1000"
                        className={`w-full bg-[#0a0a20]/80 border ${
                          recipient.error && recipient.error.includes("number")
                            ? "border-red-500"
                            : recipient.amount
                              ? "border-[#018ABD]"
                              : "border-[#475B74]/50"
                        } rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50 pr-12`}
                      />
                      {tokenInfo && recipient.amount && !recipient.error && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#97CBDC]/70 text-xs">
                          {tokenInfo.symbol}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-[#97CBDC]/70 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={recipient.email}
                      onChange={(e) =>
                        onUpdateMultipleRecipient(
                          index,
                          "email",
                          e.target.value
                        )
                      }
                      placeholder="member@example.com"
                      className="w-full bg-[#0a0a20]/80 border border-[#475B74]/50 rounded-lg p-2 text-sm text-[#97CBDC] placeholder:text-[#97CBDC]/50 focus:outline-none focus:ring-1 focus:ring-[#018ABD]/50"
                    />
                  </div>
                </div>
                {recipient.error && (
                  <p className="text-xs text-red-500 mt-1">{recipient.error}</p>
                )}
              </motion.div>
            ))}
          </div>

          {multipleRecipientsError && (
            <p className="text-sm text-red-500 mt-2">
              {multipleRecipientsError}
            </p>
          )}

          {/* Total Summary */}
          {multipleRecipients.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-[#0a0a20]/80 border border-[#475B74]/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#97CBDC]/70">Total Amount:</span>
                <span className="text-[#97CBDC] font-medium">
                  {getMultipleTotalAmount().toLocaleString()}{" "}
                  {tokenInfo?.symbol || "tokens"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={onCreateMultipleVestingSchedule}
            disabled={
              tokenLock.isProcessing ||
              !tokenAddress ||
              multipleRecipients.length === 0 ||
              !tgeDate ||
              !tgeBps ||
              !cycle ||
              !cycleBps ||
              multipleRecipients.some(
                (r) => !r.address || !r.amount || r.error
              ) ||
              multipleRecipientsError ||
              tgeDateError ||
              tgeBpsError ||
              cycleError ||
              cycleBpsError
            }
            className="px-8 py-3 h-12 text-white font-medium rounded-xl bg-gradient-to-r from-[#004581] to-[#018ABD] hover:from-[#003b6e] hover:to-[#0179a3] transition-all duration-300 shadow-lg shadow-[#004581]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tokenLock.isProcessing ? (
              <span className="flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {tokenLock.isApproving
                  ? "Approving..."
                  : "Creating Multiple Vesting Schedules..."}
              </span>
            ) : (
              `Create ${multipleRecipients.length} Vesting Schedule${multipleRecipients.length > 1 ? "s" : ""}`
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
