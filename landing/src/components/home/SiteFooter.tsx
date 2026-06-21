import Image from "next/image";
import Link from "next/link";
import {
  logoImg,
  mailIcon,
  mapIcon,
  phoneIcon,
  planeIcon,
} from "@/assets";
import { SUPPORT_EMAIL } from "@/config/constants";

export function SiteFooter() {
  return (
    <>
      <section className="as_footer_wrapper as_section_dark">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="as_footer_inner">
                <div className="row">
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="as_footer_widget">
                      <div className="as_footer_logo">
                        <Link href="/">
                          <Image src={logoImg} alt="Calyx Guru" />
                        </Link>
                      </div>
                      <p>
                        Calyx Guru — astrology-inspired guidance and mindful
                        play on mobile.
                      </p>
                      <ul className="as_contact_list">
                        <li>
                          <Image src={mapIcon} alt="" />
                          <p>NY 10018, California, USA</p>
                        </li>
                        <li>
                          <Image src={phoneIcon} alt="" />
                          <p>
                            <a href="tel:+911800124105">+ (91) 1800-124-105</a>
                          </p>
                        </li>
                        <li>
                          <Image src={mailIcon} alt="" />
                          <p>
                            <a href={`mailto:${SUPPORT_EMAIL}`}>
                              {SUPPORT_EMAIL}
                            </a>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="as_footer_widget">
                      <h3 className="as_footer_heading">Quick Links</h3>
                      <ul>
                        <li>
                          <Link href="/">Home</Link>
                        </li>
                        <li>
                          <a href="#">About Us</a>
                        </li>
                        <li>
                          <a href="#">Blog</a>
                        </li>
                        <li>
                          <Link href="/privacy-policy">Privacy Policy</Link>
                        </li>
                        <li>
                          <Link href="/terms-of-service">Terms of Service</Link>
                        </li>
                        <li>
                          <Link href="/delete-account">Delete account</Link>
                        </li>
                        <li>
                          <a href="#">Contact Us</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="as_footer_widget">
                      <h3 className="as_footer_heading">Horoscope Forecasts</h3>
                      <ul>
                        <li>
                          <a href="#">My Daily Horoscope</a>
                        </li>
                        <li>
                          <a href="#">My Weekly Horoscope</a>
                        </li>
                        <li>
                          <a href="#">My Monthly Horoscope</a>
                        </li>
                        <li>
                          <a href="#">My Love Horoscope</a>
                        </li>
                        <li>
                          <a href="#">My Career Horoscope</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-6 col-sm-12">
                    <div className="as_footer_widget">
                      <h3 className="as_footer_heading">Our Newsletter</h3>
                      <p>
                        Get updates on new features, horoscope insights, and
                        app releases.
                      </p>
                      <div className="as_newsletter_wrapper">
                        <div className="as_newsletter_box">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Email..."
                          />
                          <a href="#" className="as_btn as_btn_newsletter">
                            <Image src={planeIcon} alt="" />
                          </a>
                        </div>
                      </div>
                      <div className="as_login_data">
                        <label>
                          I agree that my submitted data is being collected and
                          stored.
                          <input type="checkbox" name="as_remember_me" />
                          <span className="checkmark" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="as_copyright_wrapper text-center">
          <p>Copyright &copy; 2026 Calyx Guru. All Rights Reserved.</p>
        </div>
      </section>
    </>
  );
}
