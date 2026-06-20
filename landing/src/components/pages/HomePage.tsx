import Image, { type StaticImageData } from "next/image";
import {
  aboutImg,
  blog1,
  blog2,
  blog3,
  cartIcon,
  compareIcon,
  product2,
  product3,
  product4,
  product5,
  ratingImg,
  serviceImg1,
  serviceImg2,
  viewIcon,
  wishlistIcon,
} from "@/assets";
import { PageLoader } from "@/components/home/PageLoader";
import { SunGlyph } from "@/components/home/SunGlyph";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { TitleLine } from "@/components/home/TitleLine";
import {
  aboutQuotes,
  blogPosts,
  horoscopeSigns,
  products,
  servicesLeft,
  servicesRight,
} from "@/components/home/home-data";

const productImages: Record<string, StaticImageData> = {
  product2,
  product3,
  product4,
  product5,
};

const blogImages: Record<string, StaticImageData> = {
  blog1,
  blog2,
  blog3,
};

function ProductActions() {
  return (
    <ul className="as_product_ul">
      <li>
        <a href="#">
          <Image src={cartIcon} alt="" />
        </a>
      </li>
      <li>
        <a href="#">
          <Image src={viewIcon} alt="" />
        </a>
      </li>
      <li>
        <a href="#">
          <Image src={wishlistIcon} alt="" />
        </a>
      </li>
      <li>
        <a href="#">
          <Image src={compareIcon} alt="" />
        </a>
      </li>
    </ul>
  );
}

function BlogMeta() {
  return (
    <>
      <li>
        <a href="#" className="as_text_color">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="16"
            height="16"
            aria-hidden
          >
            <path
              fill="#8b89a3"
              d="M210.352 246.633c33.882 0 63.222-12.153 87.195-36.13 23.973-23.972 36.125-53.304 36.125-87.19 0-33.876-12.152-63.211-36.129-87.192C273.566 12.152 244.23 0 210.352 0c-33.887 0-63.22 12.152-87.192 36.125s-36.129 53.309-36.129 87.188c0 33.886 12.156 63.222 36.133 87.195 23.977 23.969 53.313 36.125 87.188 36.125zM426.129 393.703c-.692-9.976-2.09-20.86-4.149-32.351-2.078-11.579-4.753-22.524-7.957-32.528-3.308-10.34-7.808-20.55-13.37-30.336-5.774-10.156-12.555-19-20.165-26.277-7.957-7.613-17.699-13.734-28.965-18.2-11.226-4.44-23.668-6.69-36.976-6.69-5.227 0-10.281 2.144-20.043 8.5a2711.03 2711.03 0 0 1-20.879 13.46c-6.707 4.274-15.793 8.278-27.016 11.903-10.949 3.543-22.066 5.34-33.039 5.34-10.972 0-22.086-1.797-33.047-5.34-11.21-3.622-20.296-7.625-26.996-11.899-7.77-4.965-14.8-9.496-20.898-13.469-9.75-6.355-14.809-8.5-20.035-8.5-13.313 0-25.75 2.254-36.973 6.7-11.258 4.457-21.004 10.578-28.969 18.199-7.605 7.281-14.39 16.12-20.156 26.273-5.558 9.785-10.058 19.992-13.371 30.34-3.2 10.004-5.875 20.945-7.953 32.524-2.059 11.476-3.457 22.363-4.149 32.363A438.821 438.821 0 0 0 0 423.949c0 26.727 8.496 48.363 25.25 64.32 16.547 15.747 38.441 23.735 65.066 23.735h246.532c26.625 0 48.511-7.984 65.062-23.734 16.758-15.946 25.254-37.586 25.254-64.325-.004-10.316-.351-20.492-1.035-30.242zm0 0"
            />
          </svg>
          By - Admin
        </a>
      </li>
      <li>
        <a href="#" className="as_text_color">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            width="16"
            height="16"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              fill="#8b89a3"
              d="M29.9 39.65a22.465 22.465 0 0 1-5.9.779c-11.358 0-20.5-8.325-20.5-18.467S12.642 3.5 24 3.5s20.5 8.32 20.5 18.462a17.632 17.632 0 0 1-6.55 13.533V43a1.5 1.5 0 0 1-2.442 1.166z"
            />
          </svg>
          0 comments
        </a>
      </li>
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <PageLoader />
      <>
        <section className="as_banner_wrapper">
          <div>
            <div className="row as_verticle_center">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <div className="as_banner_detail">
                  <h5>
                    Astrology is just a finger <br /> pointing at reality
                  </h5>
                  <p>
                    It is a long established fact that a reader will be
                    distracted by the readable content of a page when looking at
                    its layout. The point of using Lorem Ipsum is that it has a
                    more-or-less normal distribution of letters It is a long
                    established fact
                  </p>
                  <div className="as_banner_btn">
                    <a href="#" className="as_btn as_banner_btn1">
                      Book Now
                    </a>
                    <a href="#" className="as_btn as_btn_border">
                      Contact Us
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
                  <h1>We Can Use Astrology To Find Your Future</h1>
                  <p className="as_text_color">
                    It is a long established fact that a reader will be
                    distracted by the readable content of a page when looking at
                    its layout. The point of using Lorem Ipsum is that it has a
                    more-or-less normal distribution of letters, as opposed to
                    using &apos;Content here, content here&apos;, making it look
                    like readable English. Many desktop
                  </p>
                  <div className="as_about_inner">
                    {aboutQuotes.map((quote) => (
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
                  <a href="#" className="as_btn as_margin_top_20">
                    Read More
                  </a>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="as_aboutimg text-right">
                  <Image
                    src={aboutImg}
                    alt=""
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
                <h1 className="as_heading">Horoscope Forecasts</h1>
                <TitleLine />
                <p className="as_text_color">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page <br />
                  when looking at its layout. The point of using Lorem Ipsum .
                </p>
              </div>
              {horoscopeSigns.map((sign) => (
                <div
                  key={sign.name}
                  className="col-lg-3 col-md-6 col-sm-12"
                >
                  <div className="as_sign_box text-center">
                    <a href="#">
                      <span className="as_sign">
                        <SunGlyph />
                      </span>
                      <div>
                        <h5>{sign.name}</h5>
                        <p>{sign.dates}</p>
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="as_service_wrapper as_section_dark">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h1 className="as_heading as_heading_center">our services</h1>
                <TitleLine />
                <p className="as_text_color">
                  Consectetur adipiscing elit, sed do eiusmod tempor
                  incididuesdeentiut labore <br />
                  etesde dolore magna aliquapspendisse and the gravida.
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-12 col-sm-12">
                {servicesLeft.map((service) => (
                  <div
                    key={service.title}
                    className="as_service_box as_text_left"
                  >
                    <div className="as_service_inner_content">
                      <h4 className="as_subheading">
                        <a href="#">{service.title}</a>
                      </h4>
                      <p>{service.description}</p>
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
                    alt=""
                    className="as_service_img img-responsive"
                  />
                </div>
              </div>
              <div className="col-lg-4 col-md-12 col-dm-12">
                {servicesRight.map((service) => (
                  <div
                    key={service.title}
                    className="as_service_box as_text_rigth"
                  >
                    <div className="as_service_inner_icon">
                      <span className="as_icon">
                        <SunGlyph />
                      </span>
                    </div>
                    <div className="as_service_inner_content">
                      <h4 className="as_subheading">
                        <a href="#">{service.title}</a>
                      </h4>
                      <p className="as_paddingBottom10">{service.description}</p>
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
                <h1 className="as_heading">Popular Products </h1>
                <TitleLine />
                <p className="as_text_color">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page <br />
                  when looking at its layout. The point of using Lorem Ipsum .
                </p>
                <div className="row">
                  {products.map((product) => (
                    <div
                      key={`${product.name}-${product.imageKey}`}
                      className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                    >
                      <div className="as_product_box">
                        <div className="as_product_img">
                          <div className="as_product_svg">
                            <Image
                              src={productImages[product.imageKey]}
                              alt={product.name}
                            />
                          </div>
                          <span className={`as_new_tag ${product.tagClass}`}>
                            {product.tag}
                          </span>
                          <ProductActions />
                        </div>
                        <div className="as_product_detail">
                          <span>
                            <Image src={ratingImg} alt="" />
                          </span>
                          <h4 className="as_subheading">{product.name}</h4>
                          <span className="as_price">
                            $20.00 <del>$80.00</del>{" "}
                            <span className="as_orange" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <a href="#" className="as_btn as_margin_top_40">
                    view more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="as_blog_wrapper as_section_dark">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 col-md-12 text-center">
                <h1 className="as_heading">Latest Articles</h1>
                <TitleLine />
                <p className="as_text_color">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page <br />
                  when looking at its layout. The point of using Lorem Ipsum .
                </p>
                <div className="v3_blog_wrapper">
                  <div className="row text-left">
                    {blogPosts.map((post) => (
                      <div
                        key={post.imageKey}
                        className="col-lg-4 col-md-6 col-sm-12"
                      >
                        <div className="as_blog_box">
                          <div className="as_blog_img">
                            <a href="#">
                              <Image
                                src={blogImages[post.imageKey]}
                                alt=""
                                className="img-responsive"
                              />
                            </a>
                          </div>
                          <div className="as_blog_detail as_blog_detail_bg">
                            <ul className="as_blog_admin">
                              <BlogMeta />
                            </ul>
                            <h4 className="as_subheading">
                              <a href="#">{post.title}</a>
                            </h4>
                            <p className="as_text_color">{post.excerpt}</p>
                            <a href="#" className="as_btn">
                              Read More
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="as_testimonial_wrapper as_section_light">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h1 className="as_heading as_heading_center">Testimonial</h1>
                <TitleLine />
                <p className="as_text_color">
                  Consectetur adipiscing elit, sed do eiusmod tempor
                  incididuesdeentiut labore <br />
                  etesde dolore magna aliquapspendisse and the gravida.
                </p>
              </div>
              <div className="col-lg-12">
                <TestimonialSlider />
              </div>
            </div>
          </div>
        </section>
      </>
    </>
  );
}
