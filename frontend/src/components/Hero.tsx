import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Hero = () => {

  // const handleGetStarted = () => {
  //   try {
  //     if (isSignedIn) {
  //       navigate('/connect-gmail')
  //     } else {
  //       navigate('/sign-up') // Redirect properly
  //     }
  //   } catch (err) {
  //     console.log(err)
  //   }
  // }

  return (
    <div className="h-auto bg-white flex flex-col justify-center px-6 md:px-12 md:my-32">
      {/* Text Section */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
          Transform Your Inbox into a Powerhouse ✨
        </h1>
        <h3 className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Your personal AI agent that writes, analyzes, and handles the chaos — all from a single prompt.
        </h3>
        <div className="mt-8">
          <button
            
            className="bg-black text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-900 transition duration-300 shadow-md hover:shadow-lg"
          >
            Start Free — No Setup Needed
          </button>
          <p className="mt-2 text-sm text-gray-500">
            No credit card required — unless you're feeling generous, then drop your UPI 😉
          </p>
        </div>
      </motion.div>

      {/* Image Section */}
      <div className="flex justify-center items-end gap-2 md:gap-10">
        {/* Mobile View (left) */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <img
            src="https://res.cloudinary.com/dwrqohfya/image/upload/v1745248253/Screenshot_2025-04-21_at_2.17.25_AM_gutx3z_c_pad_w_680_zx3m5z.jpg"
            alt="Mobile view"
            className="h-40 md:h-[60vh] shadow-2xl rounded-sm md:rounded-xl"
          />
        </motion.div>

        {/* Web View (right, larger) */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <img
            src="https://res.cloudinary.com/dwrqohfya/image/upload/v1745247710/Screenshot_2025-04-21_at_2.06.47_AM_w3p5pc_cegovk.jpg"
            alt="Web view"
            className="h-48 md:h-[75vh] shadow-2xl rounded-sm md:rounded-xl"
          />
        </motion.div>
      </div>
    </div>
  )
}

export default Hero
