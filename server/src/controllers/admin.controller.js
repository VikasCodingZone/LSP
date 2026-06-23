const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");

const getSearchFilter = (search) => {
  if (!search) {
    return {};
  }

  const pattern = new RegExp(search.trim(), "i");

  return {
    $or: [
      { name: pattern },
      { email: pattern },
      { phone: pattern },
    ],
  };
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalVendors, totalTransactions, walletSummary] =
      await Promise.all([
        User.countDocuments({ accountType: "student" }),
        User.countDocuments({ accountType: "vendor" }),
        Transaction.countDocuments(),
        User.aggregate([
          { $match: { accountType: "student" } },
          {
            $group: {
              _id: null,
              totalWalletBalance: { $sum: "$walletBalance" },
              averageWalletBalance: { $avg: "$walletBalance" },
            },
          },
        ]),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalVendors,
        totalTransactions,
        totalWalletBalance: walletSummary[0]?.totalWalletBalance || 0,
        averageWalletBalance: walletSummary[0]?.averageWalletBalance || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({
      accountType: "student",
      ...getSearchFilter(req.query.search),
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getVendors = async (req, res) => {
  try {
    const vendors = await User.find({
      accountType: "vendor",
      ...getSearchFilter(req.query.search),
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, accountType: "vendor" },
      { vendorStatus: "approved" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor approved successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, accountType: "vendor" },
      { vendorStatus: "rejected" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vendor rejected successfully",
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const { studentId, amount, description } = req.body;
    const parsedAmount = Number(amount);

    if (!studentId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid studentId and amount are required",
      });
    }

    const student = await User.findOneAndUpdate(
      { _id: studentId, accountType: "student" },
      { $inc: { walletBalance: parsedAmount } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const transaction = await Transaction.create({
      student: student._id,
      type: "wallet_topup",
      amount: parsedAmount,
      status: "completed",
      description: description || "Wallet top-up by admin",
      createdBy: req.admin?._id || req.user.userId,
    });

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      student,
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("student", "name email")
      .populate("vendor", "name email")
      .populate("createdBy", "name email accountType")
      .sort({ createdAt: -1 })
      .limit(200);

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
