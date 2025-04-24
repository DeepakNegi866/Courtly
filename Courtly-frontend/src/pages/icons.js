import React from "react";
import * as Icons from "@/utils/icons";

const Allicons = () => {
    return (
        <div className="d-flex flex-wrap gap-3">
          {Object.keys(Icons).map((iconKey) => {
            const IconComponent = Icons[iconKey];
            return (
              <div key={iconKey} className="bg-secondary rounded p-3 text-white d-flex align-items-center justify-content-center">
                <IconComponent />
                <p>{iconKey}</p>
              </div>
            );
          })}
        </div>
      );
};

export default Allicons;
