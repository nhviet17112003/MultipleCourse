const Order = require("../Models/Orders");
const Course = require("../Models/Courses");
const User = require("../Models/Users");

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { courseIds } = req.body; // Array of course IDs
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const courses = await Course.find({ _id: { $in: courseIds } });
    if (courses.length === 0) {
      return res.status(404).json({ message: "Courses not found" });
    }

    const orderItems = courses.map((course) => ({
      course: course._id,
    }));

    const totalPrice = courses.reduce((sum, course) => sum + course.price, 0);

    const newOrder = new Order({
      user: user._id,
      order_items: orderItems,
      total_price: totalPrice,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get All Orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("order_items.course")
      .populate("user", "name email");
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Admin
exports.getRevenueForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );
    res.status(200).json({ totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue by Month
exports.getRevenueEachMonthForAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const revenue = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthlyRevenue = orders.reduce((sum, order) => {
        const orderMonth = order.order_date.getMonth() + 1;
        return orderMonth === month ? sum + order.total_price : sum;
      }, 0);
      return { month, revenue: monthlyRevenue };
    });

    res.status(200).json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for Today
exports.getRevenueForToday = async (req, res) => {
  try {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const orders = await Order.find({ order_date: { $gte: startOfToday } });
    const totalRevenueToday = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    res.status(200).json({ totalRevenueToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get Revenue for This Year
exports.getRevenueForThisYear = async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const orders = await Order.find({ order_date: { $gte: startOfYear } });
    const totalRevenueThisYear = orders.reduce(
      (sum, order) => sum + order.total_price,
      0
    );

    res.status(200).json({ totalRevenueThisYear });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get My Orders (User)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "order_items.course"
    );
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
