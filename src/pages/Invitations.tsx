import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TeamShowcase from "@/components/ui/team-showcase";
import { GripVertical } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function Invitations() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-32 pb-20 sera-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="sera-label text-sera-stone mb-4">Invitations</p>
            <h1 className="sera-heading text-sera-ivory text-4xl md:text-6xl mb-6">
              Design invitations
              <br /><span className="italic">worth opening</span>
            </h1>
            <p className="sera-body text-sera-sand text-lg max-w-2xl mx-auto">
              Create digital invitations and graphic flyers with full editorial control. Templates, typography, layouts — everything your event deserves.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 sera-surface-light">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TeamShowcase />
          </motion.div>

          <motion.div
            className="mb-16 border border-sera-sand/60 bg-sera-ivory/60 p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <div className="mb-5">
              <p className="sera-label text-sera-oxblood text-[9px] mb-2">Edit Invitation</p>
              <h3 className="font-serif text-sera-navy text-2xl font-light mb-2">Resizable split layout</h3>
              <p className="sera-body text-sera-warm-grey text-sm max-w-2xl">
                Add a horizontal splitter and drag the handle to rebalance your invitation composition in real time.
              </p>
            </div>

            <div className="h-52 rounded-lg border border-sera-sand/70 bg-sera-ivory overflow-hidden">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={48.2} minSize={20}>
                  <div className="flex h-full items-center justify-center p-3 text-sm text-sera-navy">Left</div>
                </ResizablePanel>
                <ResizableHandle className="w-px bg-sera-sand/70">
                  <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 block w-4 h-6 rounded-md border border-sera-sand/70 bg-sera-ivory text-sera-warm-grey">
                    <GripVertical className="w-3 h-3 mx-auto mt-1.5" />
                  </span>
                </ResizableHandle>
                <ResizablePanel defaultSize={30} minSize={15}>
                  <div className="flex h-full items-center justify-center p-3 text-sm text-sera-navy">Center</div>
                </ResizablePanel>
                <ResizableHandle className="w-px bg-sera-sand/70">
                  <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 block w-4 h-6 rounded-md border border-sera-sand/70 bg-sera-ivory text-sera-warm-grey">
                    <GripVertical className="w-3 h-3 mx-auto mt-1.5" />
                  </span>
                </ResizableHandle>
                <ResizablePanel defaultSize={21.8} minSize={15}>
                  <div className="flex h-full items-center justify-center p-3 text-sm text-sera-navy">Right</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </motion.div>

          <div className="text-center">
            <Button variant="sera" size="lg" asChild>
              <Link to="/login">Start Designing</Link>
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
