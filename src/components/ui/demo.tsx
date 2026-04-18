import { Iphone17Pro } from "@/components/ui/iphone-17-pro";
import { motion } from "framer-motion";

const DemoOne = () => {
  return (
    <section className="py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="sera-heading text-4xl mb-4">
            Designed for the guest experience
          </h2>
          <p className="sera-body text-sera-warm-grey max-w-xl mx-auto">
            Every interaction — from invitation to last drink — is designed to feel effortless, refined, and quietly impressive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {[
            "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
            "https://images.unsplash.com/photo-1520975916090-3105956dac38",
            "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
          ].map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Iphone17Pro
                src={src}
                width={260}
                height={520}
                className="mx-auto"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { DemoOne };