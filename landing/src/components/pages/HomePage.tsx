import Image from "next/image";
import { aboutImg, mailIcon, serviceImg1, serviceImg2 } from "@/assets";
import { PageLoader } from "@/components/home/PageLoader";
import { SunGlyph } from "@/components/home/SunGlyph";
import { TitleLine } from "@/components/home/TitleLine";
import { CONTACT_EMAIL } from "@/config/constants";

const FOUNDER_HIGHLIGHTS = [
  "An independent, passion-driven project from founders Chung and Cali",
  "Bridging technical engineering with creative digital artistry",
  "Cultural and spiritual fun at the heart of everything we build",
] as const;

const APP_FEATURES = [
  {
    title: "Kau-Cim",
    subtitle: "Fortune telling poems",
    description: "Draw poetic divinations rooted in tradition, reimagined for the digital age.",
  },
  {
    title: "108 Purple Star Cards",
    subtitle: "Collect & reveal",
    description: "Explore a tactile, visual card system crafted with cyberpunk spiritual flair.",
  },
  {
    title: "Elemental Magic",
    subtitle: "Mascot companions",
    description: "Interact with glowing elemental auras and playful mascot companions.",
  },
  {
    title: "Navigate Your Bloom",
    subtitle: "Your journey",
    description: "Follow a personal path of discovery through mysticism-meets-future design.",
  },
] as const;

const OFFERINGS = [
  {
    title: "Custom App & Game Development",
    description:
      "Exceptional experience building smooth, interactive, and highly stylized mobile applications and HTML5 versions.",
  },
  {
    title: "IP Licensing & Creative Assets",
    description:
      "Collaboration opportunities utilizing our cyberpunk spiritual IP, mascot designs, and custom card decks.",
  },
  {
    title: "Joint Ventures",
    description:
      "Integrating alternative entertainment systems, fortune-telling engines, or gamified mechanics into existing ecosystems.",
  },
] as const;

const PARTNER_AUDIENCE_LEFT = [
  {
    title: "Creative Studios",
    description:
      "Visual universe design, animations, mascot art, and high-fidelity card deck production.",
  },
  {
    title: "Publishers",
    description:
      "Licensing and co-publishing opportunities for spiritual entertainment IP.",
  },
  {
    title: "Indie Developers",
    description:
      "Cross-platform builds, gamified mechanics, and fortune-telling engine integration.",
  },
] as const;

const PARTNER_AUDIENCE_RIGHT = [
  {
    title: "Brand Partners",
    description:
      "Collaborations that blend mysticism, culture, and futuristic digital aesthetics.",
  },
  {
    title: "Digital Asset Teams",
    description:
      "Joint work on mascots, card decks, and interactive spiritual content libraries.",
  },
  {
    title: "Business Ventures",
    description:
      "Agile partnerships worldwide — we are innovative and ready to scale with you.",
  },
] as const;

const CONTACT_CHANNELS = [
  {
    title: "Technical Partnership",
    description: "App development, platform engineering, and technical collaboration.",
    subject: "Technical partnership inquiry",
  },
  {
    title: "Creative Collaboration",
    description: "Spiritual knowledge, branding, visual universe, and creative assets.",
    subject: "Creative collaboration inquiry",
  },
  {
    title: "General Business",
    description: "Licensing, joint ventures, and other business opportunities.",
    subject: "General business inquiry",
  },
] as const;

function ContactMailto({ subject }: { subject: string }) {
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <a href={href} className="as_home_contact_link">
      Email the founders
    </a>
  );
}

export default function HomePage() {
  const generalMailto = `mailto:${CONTACT_EMAIL}`;

  return (
    <>
      <PageLoader />
      <>
        <section className="as_banner_wrapper">
          <div>
            <div className="row as_verticle_center">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <div className="as_banner_detail">
                  <h5>Navigate Your Bloom!</h5>
                  <p>
                    Discover your destiny with Kau-Cim (fortune telling poems),
                    108 Purple Star cards, and mascot elemental magic.
                  </p>
                  <div className="as_banner_btn">
                    <a href="#partner" className="as_btn as_banner_btn1">
                      Partner With Us
                    </a>
                    <a href="#contact" className="as_btn as_btn_border">
                      Contact Founders
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="as_about_wrapper as_section_dark">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div className="as-about-heading">
                  <h1>Welcome to the Calyx Universe</h1>
                  <p className="as_text_color">
                    Hi there! Welcome to the digital sanctuary of Calyx Guru.
                  </p>
                  <p className="as_text_color">
                    Unlike massive corporate tech giants, Calyx Guru is an
                    independent, passion-driven project born from the shared
                    vision of its two founders, Chung and Cali. Together, we
                    bridge the gap between technical engineering and creative
                    digital artistry along with cultural and spiritual fun.
                  </p>
                  <div className="as_about_inner">
                    {FOUNDER_HIGHLIGHTS.map((quote) => (
                      <div key={quote} className="as_about_inner1">
                        <p className="as_text_color">
                          <span>
                            <SunGlyph />
                          </span>
                          {quote}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="as_aboutimg text-right">
                  <Image
                    src={aboutImg}
                    alt="Calyx Guru mystical visual universe"
                    className="img-responsive"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="as_horoscope_wrapper as_section_light">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 text-center">
                <h1 className="as_heading">Our Vision</h1>
                <TitleLine />
                <p className="as_home_vision_tagline">
                  Where Mysticism Meets the Future
                </p>
                <p className="as_text_color as_home_vision_lead">
                  The concept behind Calyx Guru was born from a simple question:
                  What happens when you combine age-old spiritual divination
                  with the sleek, high-tech aesthetic of tomorrow? We wanted to
                  break away from the standard, text-heavy fortune-telling apps
                  and replace them with something deeply visual, tactile, and
                  highly interactive. The team spearheads the visual universe,
                  crafting animations and the unique design of 108 Purple Star
                  Cards and the glowing elemental auras; also drives the
                  development, writing clean, optimized code to ensure the app
                  runs flawlessly, fluidly, and securely on your device.
                </p>
              </div>
              {APP_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="col-lg-3 col-md-6 col-sm-12"
                >
                  <div className="as_home_feature_box text-center">
                    <span className="as_sign">
                      <SunGlyph />
                    </span>
                    <div>
                      <h5>{feature.title}</h5>
                      <p className="as_home_feature_subtitle">
                        {feature.subtitle}
                      </p>
                      <p className="as_home_feature_desc">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="partner" className="as_service_wrapper as_section_dark">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h1 className="as_heading as_heading_center">
                  Partner with Calyx Guru
                </h1>
                <TitleLine />
                <p className="as_text_color as_home_section_lead">
                  Are you interested in digital asset collaboration,
                  cross-platform app development, or brand partnerships? The
                  founders of Calyx Guru are always looking to connect with
                  creative studios, publishers, indie developers, and business
                  partners worldwide.
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-12 col-sm-12">
                {PARTNER_AUDIENCE_LEFT.map((item) => (
                  <div
                    key={item.title}
                    className="as_service_box as_text_left"
                  >
                    <div className="as_service_inner_content">
                      <h4 className="as_subheading">{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                    <div className="as_service_inner_icon">
                      <span className="as_icon">
                        <SunGlyph />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-lg-4 col-md-12 col-dm-12">
                <div className="as_service_img">
                  <Image
                    src={serviceImg2}
                    alt=""
                    className="as_service_circle img-responsive"
                  />
                  <Image
                    src={serviceImg1}
                    alt="Calyx Guru creative services"
                    className="as_service_img img-responsive"
                  />
                </div>
              </div>
              <div className="col-lg-4 col-md-12 col-dm-12">
                {PARTNER_AUDIENCE_RIGHT.map((item) => (
                  <div
                    key={item.title}
                    className="as_service_box as_text_rigth"
                  >
                    <div className="as_service_inner_icon">
                      <span className="as_icon">
                        <SunGlyph />
                      </span>
                    </div>
                    <div className="as_service_inner_content">
                      <h4 className="as_subheading">{item.title}</h4>
                      <p className="as_paddingBottom10">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="as_product_wrapper as_section_light">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 text-center">
                <h1 className="as_heading">What We Offer</h1>
                <TitleLine />
                <p className="as_text_color as_home_section_lead">
                  We are agile, innovative, and ready to scale. Explore how we
                  can collaborate on your next project.
                </p>
                <div className="row as_home_offerings_row">
                  {OFFERINGS.map((offering) => (
                    <div
                      key={offering.title}
                      className="col-lg-4 col-md-6 col-sm-12"
                    >
                      <div className="as_home_offering_card">
                        <span className="as_home_offering_icon" aria-hidden>
                          <SunGlyph />
                        </span>
                        <h4 className="as_subheading">{offering.title}</h4>
                        <p className="as_text_color">{offering.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="as_blog_wrapper as_section_dark">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 text-center">
                <h1 className="as_heading">Get in Touch with the Founders</h1>
                <TitleLine />
                <p className="as_text_color as_home_section_lead">
                  Reach out to us directly based on your business needs. We
                  respond to every serious inquiry.
                </p>
                <div className="row text-left as_home_contact_row">
                  {CONTACT_CHANNELS.map((channel) => (
                    <div
                      key={channel.title}
                      className="col-lg-4 col-md-6 col-sm-12"
                    >
                      <div className="as_home_contact_card">
                        <h4 className="as_subheading">{channel.title}</h4>
                        <p className="as_text_color">{channel.description}</p>
                        <ContactMailto subject={channel.subject} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="as_testimonial_wrapper as_section_light">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="as_home_email_cta">
                  <div className="as_home_email_cta__icon">
                    <Image src={mailIcon} alt="" width={28} height={28} />
                  </div>
                  <div className="as_home_email_cta__content">
                    <h2 className="as_heading as_home_email_cta__title">
                      Drop us a message
                    </h2>
                    <p className="as_text_color">
                      For any inquiry — technical, creative, or business —
                      write to us at{" "}
                      <a href={generalMailto} className="as_legal_email_link">
                        {CONTACT_EMAIL}
                      </a>
                    </p>
                  </div>
                  <a href={generalMailto} className="as_btn as_home_email_btn">
                    Email Calyx Guru
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    </>
  );
}
