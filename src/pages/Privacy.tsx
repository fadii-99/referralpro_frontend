import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-gray">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-primary-blue mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-white rounded-2xl p-6 md:p-8 border border-black/5 shadow-sm space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Overview</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maiores rem nesciunt itaque,
              nihil earum libero nam dolores molestias fugiat doloremque enim consequuntur aliquid
              rerum ducimus! Adipisci sit accusamus nesciunt commodi!
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas ad ipsa non
              exercitationem amet maxime voluptatibus quibusdam aut! Possimus fugit incidunt facere
              inventore vero ad vitae! Exercitationem iste laborum a.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Data We Collect</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium soluta laborum
              quisquam repudiandae debitis earum esse, quidem dolore dolores magni id quo illum
              perferendis at maxime cumque ratione sint magnam.
            </p>
            <p className="text-gray-700 text-sm leading-relaxed mt-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit, autem?
              Suscipit eaque tempore cupiditate voluptatibus consequuntur iusto, nisi nam quisquam
              rem error itaque numquam? Delectus at tenetur numquam commodi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">How We Use Data</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente nobis, esse
              assumenda autem quam ex corrupti tempora. Iusto sunt perferendis possimus ratione
              pariatur rerum omnis obcaecati voluptas optio alias ducimus?
            </p>
          </section>

    

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Data Sharing</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint cum, ullam tenetur
              ducimus deleniti, a ad accusantium recusandae numquam omnis quam dolore, ab suscipit
              velit quas asperiores minus dolores saepe!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Data Retention</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus nam atque iure id quae
              commodi possimus placeat voluptatem velit accusantium similique perspiciatis,
              excepturi minus ratione voluptatum quam autem unde?
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Your Rights</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur ratione officia
              perspiciatis sit ullam, facilis necessitatibus. Ad, dolore quibusdam beatae explicabo,
              quasi laborum repellat commodi inventore earum non tempore odit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Security</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus nemo deleniti,
              error obcaecati velit minima eveniet porro exercitationem quas omnis cupiditate in
              eaque mollitia cumque facere repellat a eligendi illum!
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Changes to This Policy</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae quasi voluptatum
              suscipit nobis quod hic aspernatur veritatis. Praesentium alias ratione enim illum
              eius, quasi reiciendis consequuntur nam tenetur quidem quae?
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary-blue mb-2">Contact</h2>
            <p className="text-gray-700 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat illum amet accusantium,
              natus aspernatur nulla. Email us at{" "}
              <span className="text-primary-purple font-semibold">privacy@example.com</span>.
            </p>
          </section>

        
        </div>
      </div>
    </div>
  );
};

export default Privacy;
